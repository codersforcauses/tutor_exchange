var connection = require(__dirname + '/connection');
var hashes = require(__dirname + '/hashes');
var tm = require(__dirname + '/tokenManager');
var mail = require(__dirname + '/mail');
var USER_ROLES = require(__dirname + '/userRoles');


var forgotPassword = function(req, res) {
  var user = {
    userID: req.body.userID, //need a field for the student number
  };

  connection.query('CALL getUser(?);', [user.userID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (rows[0].length === 0) {
      res.json({success: false, message: 'An Error Occurred'});
      return;
    }

    var firstName = rows[0].firstName;

    var verifyToken = hashes.genRandomString(30);
    var hashedToken = hashes.saltHashPassword(verifyToken);
    var verifyLink = req.headers.host + '/#!/resetPassword?id='+details.studentNumber+'&token='+verifyToken;

    connection.query('CALL setPasswordHashAndSalt(userID, hash, salt);', [user.userID, hashedToken.passwordHash, hashedToken.salt], function(err) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      var userEmail = details.studentNumber + '@student.uwa.edu.au';
      mail.readHTMLFile(__dirname+'/../app/emailTemplates/passwordResetEmailInline.html', function(err, html) {
        var template = handlebars.compile(html);
        var replacements = {
          firstName: firstName,
          verifyLink: verifyLink,
        };
        var readyHTML = template(replacements);
        var data = {
          from: '"Volunteer Tutor Exchange" <noreply@volunteertutorexchange.com>',
          to:   userEmail,
          subject: 'Reset Password Request',
          text: verifyLink,
          html: readyHTML,
        };
        mail.sendMail(data, function(result, error) {
          if (result && result.accepted[0] === userEmail) {
            res.json({success: true, message: 'Password Reset Email Successfully Sent'});
          } else {
            res.json({success: false, message: 'An Error Occurred'});
          }
        });
      });
    });
  });
};


var resetPassword = function(req, res) {
  if (!req.body.resetData || !req.body.resetData.id || !req.body.resetData.token || !req.body.resetData.password) {
    res.status(401).send('Invalid Password Reset Request');
  }

  var resetData = req.body.resetData;

  connection.query('CALL getResetPasswordHashAndSalt(?);', [resetData.id], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (rows[0].length === 0) {
      res.status(400).send('User Not Found');
      return;
    }

    if (rows[0][0].resetPasswordHash === null || rows[0][0].resetPasswordSalt === null) {
      res.json({success: false, message: 'Reset Token already used or has expired'});
      return;
    }

    if (hashes.sha512(resetData.token, rows[0].resetPasswordSalt).passwordHash !== rows[0].resetPasswordHash) {
      res.json({success: false, message: 'Token was Invalid'});
      return;
    }

    var passhashsalt = hashes.saltHashPassword(resetData.password); //holds both hash and salt
    connection.query('CALL setPasswordHashAndSalt(?, ?, ?);', [passhashsalt.passwordHash, passhashsalt.salt, resetData.id], function(err, rows) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      connection.query('UPDATE user SET resetPasswordHash = NULL, resetPasswordSalt = NULL WHERE userID = ?;', [resetData.id], function(err, rows) {
        if (err) {
          console.log(String(err));
          res.status(500).send('There was a problem connecting to the database');
          return;
        }
      });

      res.json({success: true, message: 'Password Successfully Reset'});
    });
  });
};


var changePassword = function(req, res) {
  var user = tm.getUser(req);

  // No token = not logged in
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  if (!req.body.updatePassword || !req.body.updatePassword.old || !req.body.updatePassword.password) {
    res.status(400).send('Invalid Change Password Request');
    return;
  }

  var passwordData = req.body.updatePassword;

  connection.query('CALL getPasswordHashAndSalt(?);', [user.userID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (hashes.sha512(passwordData.old, rows[0][0].passwordSalt).passwordHash !== rows[0][0].passwordHash) {
      res.json({success: false, message: 'Your Old Password is Incorrect'});
      return;
    }

    var passhashsalt = hashes.saltHashPassword(passwordData.password);
    connection.query('CALL setPasswordHashAndSalt(?, ?, ?);', [passhashsalt.passwordHash, passhashsalt.salt, user.userID], function(err, rows) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }
      res.json({success: true, message: 'Password Successfully Changed'});
    });
  });
};


module.exports = {
  forgotPassword: forgotPassword,
  resetPassword: resetPassword,
  changePassword: changePassword,
};
