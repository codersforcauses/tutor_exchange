var express     = require('express');
var bodyParser  = require('body-parser');
var mysql       = require('mysql');
var jwt         = require('jsonwebtoken');
var crypto      = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var handlebars = require('handlebars');
var fs = require('fs');


var config      = require(__dirname + '/config');
var USER_ROLES  = require(__dirname + '/userRoles');
var SESSION_STATUS = require(__dirname + '/sessionStatus');
var CONFIRM_STATUS = require(__dirname + '/confirmationStatus');

var app = express();
app.use(bodyParser.json()); //read json
app.use(bodyParser.urlencoded({extended: true})); //read data sent in url
app.set('secret', config.secret);

/*var cheerio = require('cheerio'),
    $ = cheerio.load(fs.readFile(__dirname+'/app/templates/verifyEmail.html'));*/

var connection = mysql.createConnection(config.mysqlSettings);
connection.connect (function(error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log('Connected to mysql database');
  }
});

//from http://stackoverflow.com/questions/39489229/pass-variable-to-html-template-in-nodemailer
var readHTMLFile = function(path, callback) {
  fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};


// middleware
app.use('/*', function(req, res, next) {
  console.log(req.method + ' ' + req.originalUrl);
  next();
});


// static routing
if (config.devOptions.serveStatic) {
  app.use(express.static(__dirname + '/../app'));
  app.use('/bower_components', express.static(__dirname + '/../bower_components'));
}


app.use('/auth/register', function(req, res) {
  //var salt = req.body.user.id.toString(); // Replace with random string later
  //var passhashsalt = sha512(req.body.user.password, salt);
  var passhashsalt = saltHashPassword(req.body.user.password); //holds both hash and salt

  var post = {
    userID: req.body.user.id,
    firstName: req.body.user.firstName,
    lastName: req.body.user.lastName,
    DOB: req.body.user.DOB,
    sex: req.body.user.sex,
    phone: req.body.user.phone,
    passwordHash: passhashsalt.passwordHash,
    passwordSalt: passhashsalt.salt,  //<- Need to store salt with password.  Salt only protects against rainbow table attacks.
  };

  connection.query('SELECT * FROM user WHERE userID = ?', post.userID, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    if (rows.length !== 0) {
      res.json({success: false, message: 'User already Exists'});
      return;
    }

    connection.query('INSERT INTO user SET ?', post, function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }

      if (req.body.user.accountType !== USER_ROLES.pendingTutor && req.body.user.accountType !== USER_ROLES.tutor) {
        sendVerifyEmail(post.userID, post.firstName, req.headers.host);
        var role = USER_ROLES.pendingUser;
        var token = jwt.sign({id: post.userID, role: role}, app.get('secret'));
        res.json({success: true, message: 'Registration was Successful', name: post.firstName, role: role, token: token});
      } else {
        var tutorpost = {
          userID: req.body.user.id,
        };

        connection.query('INSERT INTO tutor SET ?', tutorpost, function(err, rows, fields) {
          if (err) {
            console.log(err);
            res.status(503).send(err);
            return;
          }

          // Uses the Bulk Insert Function to Assign Unit/Language Relationships to Tutor.
          if (req.body.user.id && req.body.user.units) {
            connection.query('INSERT INTO unitTutored (tutor, unit) VALUES ?', [formatUnitData(req.body.user.id,req.body.user.units)], function(err, rows, fields) {
              if (err) {
                console.log(err);
                res.status(503).send(err);
                return;
              }
              if (req.body.user.id && req.body.user.languages) {
                connection.query('INSERT INTO languageTutored (tutor, language) VALUES ?', [formatLanguageData(req.body.user.id,req.body.user.languages)], function(err, rows, fields) {
                  if (err) {
                    console.log(err);
                    res.status(503).send(err);
                    return;
                  }
                  sendVerifyEmail(post.userID, post.firstName, req.headers.host);
                  var role = USER_ROLES.pendingUser;
                  var token = jwt.sign({id: post.userID, role: role}, app.get('secret'));
                  res.json({success: true, message: 'Registration was Successful', name: post.firstName, role: role, token: token});
                  return;
                });
              }
            });
          }

        });
      }
    });
  });
});

app.use('/auth/login', function(req, res) {

  var details = {
    studentNumber: req.body.user.id,
    password: req.body.user.password,
  };
  //get salt for that user from the db
  connection.query('SELECT passwordSalt FROM user WHERE userID = ?', [details.studentNumber], function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }
    if (!rows || !rows[0]) {
      res.json({success: false, message: 'Username or Password was Incorrect'});
      return;
    }
    var userSalt = rows[0].passwordSalt; //get salt
    var inputHashData = sha512(details.password, userSalt);
    //query within query to check if hashes match: have to do this way afaik unless you use async
    connection.query('SELECT firstName FROM user WHERE userID = ? and passwordHash = ?', [details.studentNumber, inputHashData.passwordHash], function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }
      if (!rows || !rows[0]) {
        res.json({success: false, message: 'Username or Password was Incorrect'});
        return;
      }

      var name = rows[0].firstName;

      connection.query('SELECT emailVerified FROM user WHERE userID = ?', [details.studentNumber], function(err, rows, fields) {
        if (rows[0].emailVerified === 0) {
          role = USER_ROLES.pendingUser;
          var token = jwt.sign({id: details.studentNumber, role: role}, app.get('secret'));
          res.json({success: true, message: 'Login was Successful', name: name, role: role, token: token});
        } else {
          connection.query('SELECT userid, verified FROM tutor WHERE userID = ?', [details.studentNumber], function(err, rows, fields) {
            var role;

            if (!rows || !rows[0]) {
              role = USER_ROLES.student;
            } else if (rows[0].verified) {
              role = USER_ROLES.tutor;
            } else {
              role = USER_ROLES.pendingTutor;
            }

            var token = jwt.sign({id: details.studentNumber, role: role}, app.get('secret'));
            res.json({success: true, message: 'Login was Successful', name: name, role: role, token: token});
          });
        }
      });
      return;
    });
  });
});

app.use('/api/getprofile',function(req,res) {
  var user = getUser(req);
  console.log(user);

  if (!user) {
    res.json({success: false, message: 'Please log in to view profile'});
    return;
  }
  if (user.role == USER_ROLES.student) {
    connection.query('SELECT * FROM user WHERE userID = ?', [user.id], function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }

      if (!result || !result[0]) {
        res.send('WHO ARE YOU?'); // User deleted, but still has token
        return;
      }
      res.json(result[0]);
    });
  } else if (user.role == USER_ROLES.pendingTutor || USER_ROLES.tutor) {
    connection.query('SELECT * FROM user JOIN tutor ON user.userID = tutor.userID WHERE user.userID = ?', [user.id], function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }
      if (!result || !result[0]) {
        res.send('WHO ARE YOU?'); // User deleted, but still has token
        return;
      }

      // Get Unit and Language Data
      var tutorData = result[0];
      var unitData = [];
      var languageData = [];

      connection.query('SELECT unitID, unitName FROM tutor JOIN unitTutored ON tutor.userID = unitTutored.tutor JOIN unit ON unitTutored.unit = unit.unitID WHERE tutor.userID = ?', [user.id], function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(503).send(err);
          return;
        }

        if (!result || !result[0]) {
          res.status(503).send(err);
          return;
        }

        for (i = 0; i < result.length; i++) {
          unitData[i] = {unitID: result[i].unitID, unitName: result[i].unitName};
        }
        tutorData.units = unitData;

        connection.query('SELECT languageCode, languageName FROM tutor JOIN languageTutored ON tutor.userID = languageTutored.tutor JOIN language ON languageTutored.language = language.languageCode WHERE tutor.userID = ?', [user.id], function(err, result, fields) {
          if (err) {
            console.log(err);
            res.status(503).send(err);
            return;
          }

          if (!result || !result[0]) {
            res.status(503).send(err);
            return;
          }
          for (i = 0; i < result.length; i++) {
            languageData[i] = {languageCode: result[i].languageCode, languageName: result[i].languageName };
          }

          tutorData.languages = languageData;
          res.json(tutorData);
        });
      });
    });
  }
});

app.use('/api/updateprofile',function(req,res) {
    var user = getUser(req);

    if (!user) {
      res.json({success: false, message: 'Please log in to view profile'});
      return;
    }
    var userUpdateData = {
      phone: req.body.user.phone,
    };

    connection.query('UPDATE user SET ? WHERE userID = ?', [userUpdateData,user.id] , function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.status(503).send(err);
          return;
        }
        if (user.role == USER_ROLES.student) {
          res.json({success: true, message: 'Update Success'});
        } else if (user.role == USER_ROLES.pendingTutor || user.role == USER_ROLES.tutor) {
          var tutorUpdateData = {
            bio: req.body.user.bio,
            visible: req.body.user.visible,
          };

          connection.query('UPDATE tutor SET ? WHERE userID = ?', [tutorUpdateData, user.id], function(err, rows, fields) {
              if (err) {
                console.log(err);
                res.status(503).send(err);
                return;
              }
              //Format the MYSQL Commands
              unitDelete = mysql.format('DELETE FROM unitTutored WHERE tutor=?',[user.id]);
              unitInsert = mysql.format('INSERT INTO unitTutored (tutor, unit) VALUES ?', [formatUnitData(user.id,req.body.user.units)]);
              languageDelete = mysql.format('DELETE FROM languageTutored WHERE tutor=?',[user.id]);
              languageInsert = mysql.format('INSERT INTO languageTutored (tutor, language) VALUES ?', [formatLanguageData(user.id,req.body.user.languages)]);

              //'Bulk Update' is achieved (in the simplest way) by deleting and reinserting data in one transaction.
              //A more selective system would definitely be worth looking into
              mysqlTransaction(unitDelete, unitInsert);
              mysqlTransaction(languageDelete, languageInsert);
              res.json({success: true, message: 'Successfully Updated Values'});
            });
        }
      });
  });

app.use('/auth/upgrade', function(req, res) {
  var currentUser = getUser(req);

  if (!currentUser) {
    res.json({success: false, message: 'Please log in to view profile'});
    return;
  }

  var tutorpost = {
    userID: req.body.user.userID,
    bio: req.body.user.bio,
  };

  connection.query('INSERT INTO tutor SET ?', tutorpost, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    if (req.body.user.userID && req.body.user.units) {
      connection.query('INSERT INTO unitTutored (tutor, unit) VALUES ?', [formatUnitData(req.body.user.userID,req.body.user.units)], function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.status(503).send(err);
          return;
        }
        if (req.body.user.userID && req.body.user.languages) {
          connection.query('INSERT INTO languageTutored (tutor, language) VALUES ?', [formatLanguageData(req.body.user.userID,req.body.user.languages)], function(err, rows, fields) {
            if (err) {
              console.log(err);
              res.status(503).send(err);
              return;
            }
            var role = USER_ROLES.pendingTutor;
            var token = jwt.sign({id: tutorpost.userID, role: role}, app.get('secret'));
            res.json({success: true, message: 'Successfully Upgraded to Tutor Account', role: role, token: token});
            return;
          });
        }
      });
    }
  });
});


// Returns user details and a fresh token if presented with a token
app.use('/auth/me', function(req, res) {
  var user = getUser(req);

  if (!user) {
    res.end();
    return;
  }

  var name, role;

  connection.query('SELECT firstName, emailVerified FROM user WHERE userID = ?', [user.id], function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    if (rows.length === 0) {
      res.end();
      return;
    }

    name = rows[0].firstName;

    if (rows[0].emailVerified === 0) {
      role = USER_ROLES.pendingUser;
      var token = jwt.sign({id: user.id, role: role}, app.get('secret'));
      res.json({success: true, id: user.id, name: name, role: role, token: token});
      return;
    }

    connection.query('SELECT userid, verified FROM tutor WHERE userID = ?', [user.id], function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }

      if (rows.length === 0) {
        role = USER_ROLES.student;
      } else if (rows[0].verified) {
        role = USER_ROLES.tutor;
      } else {
        role = USER_ROLES.pendingTutor;
      }

      var token = jwt.sign({id: user.id, role: role}, app.get('secret'));
      res.json({success: true, id: user.id, name: name, role: role, token: token});
      return;
    });
  });
});


// Fetch all Units/Languages available. Useful for Applyform and others
app.use('/api/data/units',function(req,res) {
    connection.query('SELECT * FROM unit', function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }
      res.json(result);
    });
  });

app.use('/api/data/languages',function(req,res) {
    connection.query('SELECT * FROM language', function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }
      res.json(result);
    });
  });


// Search for tutors
app.use('/api/search', function(req, res) {
    var currentUser = getUser(req);

    if (!currentUser || !req.body || !req.body.query || !req.body.query.units) {
      res.status(503).send('Invalid Search Query');
      return;
    }

    var searchQuery;
    var resultQuery = [];

    var queryString = 'SELECT GROUP_CONCAT(DISTINCT languageName) AS language, GROUP_CONCAT(DISTINCT unitID) AS unitID, tutor.userID, firstName, lastName, phone, bio FROM tutor JOIN languageTutored ON tutor.userID = languageTutored.tutor JOIN language ON languageTutored.language = language.languageCode JOIN unitTutored ON unitTutored.tutor = tutor.userID JOIN unit ON unitTutored.unit = unit.unitID JOIN user ON user.userID = tutor.userID WHERE visible = 1 AND emailVerified = 1 AND Verified = 1 AND tutor.userID <> ? GROUP BY tutor.userID HAVING unitID LIKE ? AND language LIKE ?';

    if (!req.body.query.languages) {
      searchQuery = mysql.format(queryString, [currentUser.id,'%'+req.body.query.units.unitID+'%','%']);
    } else {
      searchQuery = mysql.format(queryString, [currentUser.id,'%'+req.body.query.units.unitID+'%','%'+req.body.query.languages.languageName+'%']);
    }

    connection.query(searchQuery, function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }
      for (i = 0; i < rows.length; i++) {
        var resultRow = {
          studentNumber: rows[i].userID,
          name: rows[i].firstName + ' ' + rows[i].lastName,
          phone: rows[i].phone,
          bio: rows[i].bio,
          units: rows[i].unitID.split(','),
          languages: rows[i].language.split(','),
        };
        resultQuery.push(resultRow);
      }
      res.json(resultQuery);
    });

  });



/*  Session pipeline:
 *
 *  request -> appointment -> openSession -> closedSession
 *
 *  A tutor creates a request.
 *  The student either accepts or rejects the request.  If accepted, the request becomes an appointment.
 *  After the session finish time, the appointment becomes an openSession.
 *  A user then closes the openSession or creates an appeal.  Either case the openSession becomes a closedSession.
 *
 *  Whether a session is open or closed depends on the user.  A session will often be open for one user but closed for the other.
 *  Use some sort of status flag to keep track of whether a session is a request, an appointment, open, semiclosed or closed.
 *  Ignore the arrays below.  They will only work for one user only.
 *
 *  Also remember that tutors may be tutored by other tutors.
 */

// sessionStatus - 0: Request,    1: Appointment,    2: Completed,    3: Cancelled
//confirmationStatus - 0: Not Confirmed,    1: Confirmed by Tutor,    2: Confirmed by Tutee    3: Fully Confirmed

// Returns a list of session requests.
app.use('/api/session/get_requests', function(req, res) {
  var currentUser = getUser(req);

  if (!currentUser) {
    res.status(401).send('Not Logged in. Cannot Fetch API Data');
    return;
  }

  //connection.query('SELECT * FROM session WHERE sessionStatus = 0 AND (tutee = ? OR tutor = ?)',[currentUser.id, currentUser.id], function(err, result, fields) {
  connection.query('(SELECT session.*, firstName, lastName, phone FROM session JOIN user ON session.tutor = user.userID WHERE sessionStatus = 0 AND tutee = ?) UNION (SELECT session.*, firstName, lastName, phone FROM session JOIN user ON session.tutee = user.userID WHERE sessionStatus = 0 AND tutor = ?) ORDER BY time;', [currentUser.id, currentUser.id], function(err, result, fields) {

    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    var requests = [];

    for (i = 0; i < result.length; i++) {
      requests.push({
        sessionID: result[i].sessionID,
        otherUser: {
          userID: (result[i].tutor === currentUser.id ? result[i].tutee : result[i].tutor),
          firstName: result[i].firstName,
          lastName: result[i].lastName,
          phone: result[i].phone,
        },
        time: result[i].time,
        unit: result[i].unit,
        comments: result[i].comments,
        isTutor: (result[i].tutor === currentUser.id),
      });
    }

    res.json(requests);
  });
});

// Return list of upcoming future (accepted) sessions
app.use('/api/session/get_appointments', function(req, res) {
  var currentUser = getUser(req);

  if (!currentUser) {
    res.status(401).send('Not Logged in. Cannot Fetch API Data');
    return;
  }
  //connection.query('SELECT * FROM session WHERE sessionStatus = 1 AND hoursAwarded = 0 AND (tutee = ? OR tutor = ?)',[currentUser.id, currentUser.id], function(err, result, fields) {
  connection.query('(SELECT session.*, firstName, lastName, phone FROM session JOIN user ON session.tutor = user.userID WHERE (sessionStatus = 1 OR sessionStatus = 3) AND tutee = ?) UNION (SELECT session.*, firstName, lastName, phone FROM session JOIN user ON session.tutee = user.userID WHERE (sessionStatus = 1 OR sessionStatus = 3) AND tutor = ?) ORDER BY time;', [currentUser.id, currentUser.id], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    var appointments = [];

    for (i = 0; i < result.length; i++) {
      appointments.push({
        sessionID: result[i].sessionID,
        otherUser: {
          userID: (result[i].tutor === currentUser.id ? result[i].tutee : result[i].tutor),
          firstName: result[i].firstName,
          lastName: result[i].lastName,
          phone: result[i].phone,
        },
        time: result[i].time,
        unit: result[i].unit,
        comments: result[i].comments,
        isTutor: (result[i].tutor === currentUser.id),
        cancelled: (result[i].sessionStatus !== 1),
      });
    }

    res.json(appointments);
  });
});

// Return list of open sessions to be signed off on
app.use('/api/session/get_open_sessions', function(req, res) {
  var currentUser = getUser(req);

  if (!currentUser) {
    res.status(401).send('Not Logged in. Cannot Fetch API Data');
    return;
  }

  //confirmationStatus - 0: Not Confirmed,    1: Confirmed by Tutor,    2: Confirmed by Tutee    3: Fully Confirmed
  connection.query('(SELECT session.*, firstName, lastName FROM session JOIN user ON session.tutor = user.userID WHERE sessionStatus = 2 AND tutee = ? AND (confirmationStatus = 0 OR confirmationStatus = 1)) UNION (SELECT session.*, firstName, lastName FROM session JOIN user ON session.tutee = user.userID WHERE sessionStatus = 2 AND tutor = ? AND (confirmationStatus = 0 OR confirmationStatus = 2)) ORDER BY time;',[currentUser.id, currentUser.id], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    var openSessions = [];

    for (i = 0; i < result.length; i++) {
      openSessions.push({
        sessionID: result[i].sessionID,
        otherUser: {
          userID: (result[i].tutor === currentUser.id ? result[i].tutee : result[i].tutor),
          firstName: result[i].firstName,
          lastName: result[i].lastName,
        },
        time: result[i].time,
        unit: result[i].unit,
        isTutor: (result[i].tutor === currentUser.id),
      });
    }

    res.json(openSessions);
  });
});

// Creates a new session + request
app.use('/api/session/create_request', function(req, res) {
  var currentUser = getUser(req);

  if (!currentUser) {
    res.status(401).send('Not Logged in');
    return;
  }

  if (currentUser.role !== USER_ROLES.tutor) {
    res.status(403).send('Only tutors can create session requests');
    return;
  }

  var requestData = {
    tutor: currentUser.id,
    tutee: req.body.session.otherUser.userID,
    unit: req.body.session.unit,
    time: req.body.session.time,
    comments: req.body.session.comments,
    sessionStatus: 0,
    confirmationStatus: 0,
    hoursAwarded: 0,
  };


  if (parseInt(requestData.tutor) === parseInt(requestData.tutee)) {
    res.json({success: false, message: 'You cannot have a tutoring session with yourself.'});
    return;
  }

  if (Date.parse(requestData.time + ' GMT+0800') < Date.now()) {
    res.json({success: false, message: 'You cannot arrange tutoring sessions in the past.'});
    return;
  }

  connection.query('SELECT COUNT(*) as userExists FROM user WHERE userID = ? AND emailVerified = 1;', [requestData.tutee], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    if (!result[0].userExists) {
      res.json({success: false, message: 'Your student isn\'t fully registered with the system yet.  Make sure he/she is signed up andhas responded to the confirmation email.'});
      return;
    }

    connection.query('select ? as userID, \'student\' as role, time from session where (tutor = ? OR tutee = ?) AND sessionStatus = 1 UNION select ? as userID, \'tutor\' as role, time from session where (tutor = ? OR tutee = ?) AND sessionStatus = 1;', [requestData.tutee, requestData.tutee, requestData.tutee, requestData.tutor, requestData.tutor, requestData.tutor], function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }

      for (var i=0; i<result.length; i++) {
        if (Math.abs(Date.parse(result[i].time) - Date.parse(requestData.time)) < 1*60*60*1000) {
          var message = (result[i].userID == currentUser.id ? 'You have ': 'Your ' + result[i].role + ' has ') + 'a timetable clash.';
          res.json({success: false, message: message});
          return;
        }
      }

      connection.query('INSERT INTO session SET ?', requestData, function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(503).send(err);
          return;
        }
        res.json({success: true});
      });
    });
  });
});


// Accepts a session request
app.use('/api/session/accept_request', function(req, res) {
  //May need to confirm Session request actually exists and is linked to current user...
  var currentUser = getUser(req);

  if (!currentUser) {
    res.status(401).send('Not Logged in');
    return;
  }

  if (!req.body || !req.body.sessionID) {
    res.status(400).send('Session ID not supplied');
    return;
  }

  connection.query('SELECT tutor, tutee, time FROM session WHERE sessionID = ?', [req.body.sessionID], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    if (result.length === 0) {
      res.status(400).send('Session does not exist');
      return;
    }

    var requestData = {
      sessionID: req.body.sessionID,
      tutor: result[0].tutor,
      tutee: result[0].tutee,
      time: result[0].time,
    };

    if (Date.parse(requestData.time + ' GMT+0800') < Date.now() + 1*60*60*1000) {
      res.json({success: false, message: 'You cannot attend a tutoring sessions in the past without a time machine.'});
      return;
    }

    connection.query('select ? as userID, \'student\' as role, time from session where (tutor = ? OR tutee = ?) AND sessionStatus = 1 UNION select ? as userID, \'tutor\' as role, time from session where (tutor = ? OR tutee = ?) AND sessionStatus = 1;', [requestData.tutee, requestData.tutee, requestData.tutee, requestData.tutor, requestData.tutor, requestData.tutor], function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }

      for (var i=0; i<result.length; i++) {
        if (Math.abs(Date.parse(result[i].time) - Date.parse(requestData.time)) < 1*60*60*1000) {
          var message = (result[i].userID == currentUser.id ? 'You have ': 'Your ' + result[i].role + ' has ') + 'a timetable clash.';
          res.json({success: false, message: message});
          return;
        }
      }

      connection.query('UPDATE session SET sessionStatus = 1 WHERE sessionID = ? AND (tutee = ? OR tutor = ?)', [requestData.sessionID, currentUser.id, currentUser.id], function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(503).send(err);
          return;
        }
        res.json({success: true});
      });
    });
  });
});


// Reject a session request
app.use('/api/session/reject_request', function(req, res) {
  var currentUser = getUser(req);

  if (!currentUser) {
    res.status(401).send('Not Logged in');
    return;
  }

  if (!req.body || !req.body.sessionID) {
    res.status(400).send('Session ID not supplied');
    return;
  }

  connection.query('DELETE FROM session WHERE sessionID = ? AND (tutee = ? OR tutor = ?)', [req.body.sessionID, currentUser.id, currentUser.id], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }
    res.end();
  });

});


// Cancel an appointment
app.use('/api/session/cancel_appointment', function(req, res) {
  var currentUser = getUser(req);

  if (!currentUser) {
    res.status(401).send('Not Logged in');
    return;
  }

  if (!req.body || !req.body.sessionID) {
    res.status(400).send('Session ID not supplied');
    return;
  }

  connection.query('UPDATE session SET sessionStatus = 3 WHERE sessionID = ? AND (tutee = ? OR tutor = ?)',[req.body.sessionID, currentUser.id, currentUser.id], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }
    res.json(result);
  });
});

// Signs off on an open session
app.use('/api/session/close_session', function(req, res) {
  var currentUser = getUser(req);

  if (!currentUser) {
    res.status(401).send('Not Logged in');
    return;
  }

  if (!req.body || !req.body.sessionID) {
    res.status(400).send('Session ID not supplied');
    return;
  }

  connection.query('SELECT tutor, tutee, confirmationStatus FROM session WHERE sessionID = ? AND sessionStatus = 2 AND (tutee = ? OR tutor = ?)', [req.body.sessionID, currentUser.id, currentUser.id], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    if (result.length === 0) {
      res.status(400).send('Session doesn\'t exist');
      return;
    }

    //confirmationStatus - 0: Not Confirmed,    1: Confirmed by Tutor,    2: Confirmed by Tutee    3: Fully Confirmed
    var confirmationStatus = result[0].confirmationStatus;

    if (currentUser.id === result[0].tutor && (confirmationStatus === 0 || confirmationStatus === 2)) {
      confirmationStatus += 1;
    }

    if (currentUser.id === result[0].tutee && (confirmationStatus === 0 || confirmationStatus === 1)) {
      confirmationStatus += 2;
    }


    connection.query('UPDATE session SET confirmationStatus = ? WHERE sessionID = ?', [confirmationStatus, req.body.sessionID], function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }
      res.end();
    });
  });
});

// Close on open session by creating an appeal
app.use('/api/session/appeal_session', function(req, res) {
  var currentUser = getUser(req);

  if (!currentUser) {
    res.status(401).send('Not Logged in');
    return;
  }

  if (!req.body || !req.body.sessionID) {
    res.status(400).send('Session ID not supplied');
    return;
  }

  connection.query('SELECT tutor, tutee, confirmationStatus FROM session WHERE sessionID = ? AND sessionStatus = 2 AND (tutee = ? OR tutor = ?)', [req.body.sessionID, currentUser.id, currentUser.id], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    if (result.length === 0) {
      res.status(400).send('Session doesn\'t exist');
      return;
    }

    //confirmationStatus - 0: Not Confirmed,    1: Confirmed by Tutor,    2: Confirmed by Tutee    3: Fully Confirmed
    var confirmationStatus = result[0].confirmationStatus;

    if (currentUser.id === result[0].tutor && (confirmationStatus === 0 || confirmationStatus === 2)) {
      confirmationStatus += 1;
    }

    if (currentUser.id === result[0].tutee && (confirmationStatus === 0 || confirmationStatus === 1)) {
      confirmationStatus += 2;
    }


    connection.query('UPDATE session SET confirmationStatus = ?, hoursAwarded = 0 WHERE sessionID = ?', [confirmationStatus, req.body.sessionID], function(err, result, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }

      var requestData = {
        sessionID: req.body.sessionID,
        userID: currentUser.id,
        reason: req.body.reason || '',
      };

      connection.query('INSERT INTO sessionComplaint SET ?', requestData, function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(503).send(err);
          return;
        }
        res.end();
      });
    });
  });
});

app.use('/emailVerify', function(req,res) {
  if (!req.query.id || !req.query.code) {
    res.status(401).send('Invalid Email Verification Request');
  }
  connection.query('SELECT emailVerified FROM user WHERE userID = ? AND verifyCode = ?',[req.query.id, req.query.code], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }
    if (!result || !result[0]) {
      res.status(401).send('User Not Found or Code may have expired');
      return;
    }

    if (result[0].emailVerified === 0) {
      connection.query('UPDATE user SET emailVerified = 1 WHERE userID = ?',[req.query.id], function(err, result, fields) {
        if (err) {
          console.log(err);
          res.status(503).send(err);
          return;
        }
        res.redirect('/#!/login');//Maybe have a seperate 'verify success' page?
      });
    } else {
      res.status(503).send('User is Already Verified');
      return;
    }
  });
});

//allow users to send an email with a link to a password reset page
//ideally will be linked to from the login page
//will require front-end support
app.use('/auth/forgotPassword', function(req,res) {
  var details = {
    studentNumber: req.body.user.id, //need a field for the student number
  };

  //check if user exists and only send email if they do - but don't communicate this to the user
  connection.query('SELECT * FROM user WHERE userID = ?', [details.studentNumber], function(err, rows, fields) {
    if (rows.length === 1) { //if user exists
      var userEmail = details.studentNumber + '@student.uwa.edu.au';
      //set mail data
      var data = {
        from: '"Volunteer Tutor Exchange" <noreply@volunteertutorexchange.com>',
        to:   userEmail,
        subject: 'Reset Password Request',
        text: verifyLink,
        html: '<p>Hey '+rows[0].firstName+',<p> To reset your password, ' +
        '<a href="'+verifyLink+'">Click Here</a> and follow the instructions provided.' +
        ' <p>Didn\'t request a password reset? No worries, you can safely ignore this email.<p>' +
        'Regards, <br> the Volunteer Tutor Exchange team</p>',
      };

      sendMail(data);
    }
  });
});

// Get name from student number
app.use('/api/who/get_name', function(req, res) {
  var currentUser = getUser(req);

  if (!currentUser) {
    res.status(401).send('Not Logged in');
    return;
  }

  if (currentUser.role !== USER_ROLES.tutor && currentUser.role !== USER_ROLES.admin) {
    res.status(403).send('You don\'t have the authority');
    return;
  }

  if (!req.body || !req.body.userID) {
    res.status(400).send('userID not supplied');
    return;
  }

  connection.query('SELECT firstName, lastName FROM user WHERE userID = ?', [req.body.userID], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    if (result.length === 0) {
      res.json({userDoesNotExist: true});
      return;
    }

    res.json(result[0]);
  });

});

app.use('/api/mail/sendVerifyEmail', function(req, res) {
    var currentUser = getUser(req);

    if (!currentUser) {
      res.status(401).send('Not Logged in');
      return;
    }

    if (currentUser.role !== USER_ROLES.pendingUser) {
      res.status(403).send('Your Account is Already Verified');
      return;
    }
    
    connection.query('SELECT firstName FROM user WHERE userID = ?', [currentUser.id], function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }
      
      sendVerifyEmail(currentUser.id, rows[0], req.headers.host, function(result, err) {
        if (err) {
          res.json({success: false, message: 'An Error Occurred when Sending Verification Email'});
          return;
        }
        res.json(result);
      });
     });
    
  });

// Serve
app.listen(config.server.port, function() {
  console.log('Live at http://localhost:' + config.server.port);
});

function getUser(req) {
  var token = (req.body && req.body.token) || (req.query && req.query.token) || (req.headers && req.headers.authorization);
  //console.log(token);

  if (!token || token.substring(0, 6) !== 'Bearer') {
    return false;
  }

  token = token.split(' ')[1];

  try {
    var decoded = jwt.verify(token, app.get('secret'));
    //console.log(decoded);
    return {id: decoded.id, role: decoded.role};
  } catch (err) {
    //console.log('bad token');
    return false;
  }
}


/**
 * Helper Functions for Bulk Insert/Update
 * @function
 * @param {string} userID - ID used for each.
 * @param {string} obj - JSON of various values.
 */
function formatUnitData(userID, obj) {
  var result = [];
  for (i = 0; i < obj.length; i++) {
    result[i] = [userID,obj[i].unitID];
  }
  return result;
}

function formatLanguageData(userID, obj) {
  var result = [];
  for (i = 0; i < obj.length; i++) {
    result[i] = [userID,obj[i].languageCode];
  }
  return result;
}

/**
 * Simple 2 Query Transaction. queryA -> queryB
 * @function
 * @param {string} queryA - First Query to be executed.
 * @param {string} queryB - Second Query to be executed.
 */
function mysqlTransaction(queryA, queryB) {
  return connection.beginTransaction(function(err) {
    if (err) { return err; }
    connection.query(queryA, function(error, rows, fields) {
      if (error) {
        return connection.rollback(function() {
          console.log(error);
        });
      }

      connection.query(queryB, function(error, results, fields) {
        if (error) {
          return connection.rollback(function() {
            console.log(error);
          });
        }
        connection.commit(function(error) {
          if (error) {
            return connection.rollback(function() {
              console.log(error);
            });
          }
          return {success: true, message: 'Transaction Processed Successfully'};
        });
      });
    });
  });
}


function sendVerifyEmail(userID, firstName, hostURL, callback) { //hostURL eg. http://localhost:8080, www.volunteertutorexchange.com etc
  if (!config.devOptions.sendMail) return;

  var verifyCode = genRandomString(20);
  var userEmail = userID + '@student.uwa.edu.au';
  var verifyLink = hostURL+'/emailVerify?id='+userID+'&code='+verifyCode;

  connection.query('UPDATE user SET verifyCode = ? WHERE userID = ?',[verifyCode, userID], function(err, result, fields) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(hostURL);
    readHTMLFile(__dirname+'/../app/emailTemplates/verifyEmailInline.html', function(err, html) {
      //var sauce = $("#verify-email").html();
      var template = handlebars.compile(html)/*sauce*/;
      var replacements = {
          firstName: firstName,
          verifyLink: verifyLink,
      };
      var readyHTML = template(replacements);
      var data = {
          from: '"Volunteer Tutor Exchange" <noreply@volunteertutorexchange.com>',
          to:   userEmail,
          subject: 'Email Verification',
          text: 'Hi '+firstName+', welcome to Volunteer Tutor Exchange! Please click the link to verify your account. '+verifyLink,
          html: readyHTML,
      };
      sendMail(data, function(result, error) {
        if (result && result.accepted[0] === userEmail) {
          callback({success: true, message: 'Verification Email Successfully Sent'});
        } else {
          callback(result, error);
        }
      });
    });
  });
}

function sendMail(mailOptions, callback) {
  if (!config.devOptions.sendMail) return;

  var transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: config.mailgunServer,
  });

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return callback(info, error);
    }
    return callback(info);
  });

}

/** [from https://code.ciphertrick.com/2016/01/18/salt-hash-passwords-using-nodejs-crypto/]
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
function genRandomString(length) {
  return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0,length);   /** return required number of characters */
}


/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
function sha512(password, salt) {
  var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  var value = hash.digest('hex');
  return {
    salt: salt,
    passwordHash: value,
  };
}

function saltHashPassword(userpassword) {
  var salt = genRandomString(16); /** Gives us salt of length 16 */
  var passwordData = sha512(userpassword, salt);
  return passwordData;
}
