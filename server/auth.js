var connection = require(__dirname + '/connection');
var hashes = require(__dirname + '/hashes');
var tm = require(__dirname + '/tokenManager');
var mail = require(__dirname + '/mail');
var USER_ROLES = require(__dirname + '/userRoles');

var login = function(req, res) {

  var details = {
    userID: req.body.user.id,
    password: req.body.user.password,
  };

  // Get user's password hash and salt from database
  connection.query('CALL getPasswordHashAndSalt(?);', [details.userID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (rows[0].length === 0) {
      // No rows = no user
      res.json({success: false, message: 'Username or password was incorrect.'});
      return;
    }

    var passwordHash = rows[0][0].hash;
    var passwordSalt = rows[0][0].salt;

    // Check password is correct
    if (passwordHash !== hashes.sha512(details.password, passwordSalt)) {
      res.json({success: false, message: 'Username or password was incorrect.'});
      return;
    }

    // User password correct.  Now get user's name
    connection.query('CALL getUser(?);', [details.userID], function(err, rows) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      if (rows[0].length === 0) {
        // No rows = no user.  Someone has deleted user in between mysql queries
        res.json({success: false, message: 'There was a problem accessing your account.  Please contact VET support.'});
        return;
      }

      // Get first name
      details.firstName = rows[0][0].firstName;


      // Now get account status
      connection.query('CALL getAccountStatus(?);', [details.userID], function(err, rows) {
        if (err) {
          console.log(String(err));
          res.status(500).send('There was a problem connecting to the database');
          return;
        }

        if (rows[0].length === 0) {
          // No rows = no user.  Someone has deleted user in between mysql queries
          res.json({success: false, message: 'There was a problem accessing your account.  Please contact VTE support.'});
          return;
        }

        if (rows[0][0].isBanned) {
          // User is banned.  Get them to contact support
          res.json({success: false, message: 'There was a problem accessing your account.  Please contact VTE support.'});
          return;
        }

        // Get role
        var role = USER_ROLES.pendingUser;

        if (rows[0][0].isEmailVerified && !rows[0][0].isTutor) {
          role = USER_ROLES.student;

        } else if (rows[0][0].isEmailVerified && rows[0][0].isTutor && !rows[0][0].isVetted) {
          role = USER_ROLES.pendingTutor;

        } else if (rows[0][0].isEmailVerified && rows[0][0].isTutor && rows[0][0].isVetted) {
          role = USER_ROLES.tutor;
        }

        // Sign token and send response
        var token = tm.sign(details.studentNumber, role);
        res.json({success: true, message: 'Login was Successful', name: details.firstName, role: role, token: token});
      });
    });
  });
};


var register = function(req, res) {

  var passwordHashAndSalt = saltHashPassword(req.body.user.password);

  var newUser = {
    userID: req.body.user.id,
    firstName: req.body.user.firstName,
    lastName: req.body.user.lastName,
    DOB: req.body.user.DOB,
    sex: req.body.user.sex,
    phone: req.body.user.phone,
    passwordHash: passwordHashAndSalt.passwordHash,
    passwordSalt: passwordHashAndSalt.salt,  //<- Need to store salt with password.  Salt only protects against rainbow table attacks.
  };

  // Check if user already exists
  connection.query('CALL userExists(?);', newUser.userID, function(err, rows, fields) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (rows[0][0].userExists) {
      res.json({success: false, message: 'User already Exists'});
      return;
    }

    // Add user to database
    connection.query('CALL createUser(?, ?, ?, ?, ?, ?, ?, ?);', [newUser.userID, newUser.firstName, newUser.lastName, newUser.DOB, newUser.sex, newUser.phone, newUser.passwordHash, newUser.passwordSalt], function(err, rows) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      // Now check if user just wants to be a student
      if (req.body.user.accountType !== USER_ROLES.pendingTutor && req.body.user.accountType !== USER_ROLES.tutor) {
        mail.sendVerifyEmail(newUser.userID, newUser.firstName, req.headers.host);
        var role = USER_ROLES.pendingUser;
        var token = tm.sign(details.studentNumber, role);
        res.json({success: true, message: 'Registration was Successful', name: newUser.firstName, role: role, token: token});
        return;
      }

      // Else user want's to be a tutor.
      connection.query('CALL upgradeToTutor(?);', [newUser.userID], function(err, rows) {
        if (err) {
          console.log(String(err));
          res.status(500).send('There was a problem connecting to the database');
          return;
        }

        // Assign units (this will be async and unchecked)
        req.body.user.units.forEach(function(unit) {
          connection.query('CALL assignUnitTutored(?, ?);', [newUser.userID, unit], function(err) {
            if (err) console.log(String(err));
          });
        });

        // Assign languages (async and unchecked)
        req.body.user.languages.forEach(function(language) {
          connection.query('CALL assignLanguageTutored(?, ?);', [newUser.userID, language], function(err) {
            if (err) console.log(String(err));
          });
        });

        mail.sendVerifyEmail(newUser.userID, newUser.firstName, req.headers.host);
        var role = USER_ROLES.pendingUser;
        var token = tm.sign(newUser.userID, role);
        res.json({success: true, message: 'Registration was Successful', name: newUser.firstName, role: role, token: token});
        return;
      });
    });
  });
};


var upgrade = function(req, res) {
  var user = tm.getUser(req);

  // If no user, user doesn't have a token or token is expired.
  if (!user) {
    res.status(401).send('Please log in to view profile');
    return;
  }

  // User has to be a student (not a pending user) to upgrade account.  Send generic 'contact vte' message.
  if (user.role != USER_ROLES.student) {
    res.json({success: false, message: 'There was a problem with your account.  Please contact VTE support.'});
    return;
  }

  // Get rest of data from req
  user.bio = req.body.user.bio || '';
  user.units = req.body.user.units || [];
  user.languages = req.body.user.languages || [];

  // Upgrade user
  connection.query('CALL upgradeToTutor(?);', [user.userID], function(err) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    // Update bio (async)
    connection.query('CALL updateTutorProfile(?, ?, ?);', [user.userID, user.bio, 0], function(err) {
      if (err) console.log(String(err));
    });

    // Add units (async)
    user.units.forEach(function(unit) {
      connection.query('CALL assignUnitTutored(?, ?);', [user.userID, unit], function(err) {
        if (err) console.log(String(err));
      });
    });

    // Add languages (async)
    user.languages.forEach(function(language) {
      connection.query('CALL assignUnitTutored(?, ?);', [user.userID, language], function(err) {
        if (err) console.log(String(err));
      });
    });

    // Send tutor information email and give user a new token
    connection.query('CALL getUser(?)', [user.userID], function(err, rows) {
      if (err) {
        console.log(String(err));
        return;
      }

      //sendTutorInfoEmail(user.userID, rows[0][0].firstName);
      var role = USER_ROLES.pendingTutor;
      var token = tm.sign(user.userID, role);
      res.json({success: true, message: 'Successfully Upgraded to Tutor Account', role: role, token: token});
    });
  });
};


var me = function(req, res) {
  var user = tm.getUser(req);

  // If no user, user doesn't have a token or token is expired.
  if (!user) {
    res.json({success: false});
    return;
  }

  connection.query('CALL getUser(?);', [user.userID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    // If no rows were returned, the user has been removed from database since token was generated.
    if (rows[0].length === 0) {
      res.json({success: false});
      return;
    }

    user.firstName = rows[0][0].firstName;

    connection.query('CALL getAccountStatus(?);', [user.userID], function(err, rows) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      if (rows[0][0].isBanned) {
        // User is banned.
        res.json({success: false});
        return;
      }


      // Get role
      var role = USER_ROLES.pendingUser;

      if (rows[0][0].isEmailVerified && !rows[0][0].isTutor) {
        role = USER_ROLES.student;

      } else if (rows[0][0].isEmailVerified && rows[0][0].isTutor && !rows[0][0].isVetted) {
        role = USER_ROLES.pendingTutor;

      } else if (rows[0][0].isEmailVerified && rows[0][0].isTutor && rows[0][0].isVetted) {
        role = USER_ROLES.tutor;
      }

      // Sign token and send response
      var token = tm.sign(details.studentNumber, role);
      res.json({success: true, message: 'Login was Successful', name: details.firstName, role: role, token: token});
    });
  });
};


module.exports = {
  login:    login,
  register: register,
  upgrade:  upgrade,
  me:       me,
};
