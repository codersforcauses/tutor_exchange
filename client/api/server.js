var express     = require('express');
var bodyParser  = require('body-parser');
var mysql       = require('mysql');
var jwt         = require('jsonwebtoken');
var crypto      = require('crypto');

var config      = require(__dirname + '/config');


var app = express();
app.use(bodyParser.json()); //read json
app.use(bodyParser.urlencoded({extended: true})); //read data sent in url
app.set('secret', config.secret);


var connection = mysql.createConnection(config.mysqlSettings);
connection.connect (function(error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log('Connected to mysql database');
  }
});


// middleware
app.use('/*', function(req, res, next) {
  console.log(req.method + ' ' + req.originalUrl);
  next();
});


// static routing
app.use(express.static(__dirname + '/../app'));
app.use('/bower_components', express.static(__dirname + '/../bower_components'));


app.use('/auth/register', function(req, res) {
  //var salt = req.body.user.id.toString(); // Replace with random string later
  //var passhashsalt = sha512(req.body.user.password, salt);
  var passhashsalt = saltHashPassword(req.body.user.password); //holds both hash and salt

  var post = {
    userID: req.body.user.id,
    name: req.body.user.name,
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

      if (!req.body.user.tutor) {
        var token = jwt.sign({id: post.userID, role: 'student'}, app.get('secret'));
        res.json({success: true, message: 'Registration was Successful', name: post.name, role: 'student', token: token});
      } else {
        var tutorpost = {
          userID: req.body.user.id,
          postcode: req.body.user.postcode,
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
                  var token = jwt.sign({id: post.userID, role: 'pendingTutor'}, app.get('secret'));
                  res.json({success: true, message: 'Registration was Successful', name: post.name, role: 'pendingTutor', token: token});
                  return;
                });
              }
            });
          }

        });
        console.log(req.body.user.units);

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
    console.log('login with hash ' + inputHashData.passwordHash);
    connection.query('SELECT name FROM user WHERE userID = ? and passwordHash = ?', [details.studentNumber, inputHashData.passwordHash], function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.status(503).send(err);
        return;
      }
      if (!rows || !rows[0]) {
        res.json({success: false, message: 'Username or Password was Incorrect'});
        return;
      }

      var name = rows[0].name;

      connection.query('SELECT userid, verified FROM tutor WHERE userID = ?', [details.studentNumber], function(err, rows, fields) {
        var token;

        if (!rows || !rows[0]) {
          token = jwt.sign({id: details.studentNumber, role: 'student'}, app.get('secret'));
          res.json({success: true, message: 'Login was Successful', name: name, role: 'student', token: token});
          return;
        }

        if (rows[0].verified) {
          token = jwt.sign({id: details.studentNumber, role: 'tutor'}, app.get('secret'));
          res.json({success: true, message: 'Login was Successful', name: name, role: 'tutor', token: token});
          return;
        }

        token = jwt.sign({id: details.studentNumber, role: 'pendingTutor'}, app.get('secret'));
        res.json({success: true, message: 'Login was Successful', name: name, role: 'pendingTutor', token: token});
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
  if (user.role == 'student') {
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
  } else if (user.role == 'pendingTutor' || user.role == 'tutor') {
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
        if (user.role == 'student') {
          res.json({success: true, message: 'Update Success'});
        } else if (user.role == 'pendingTutor' || user.role == 'tutor') {
          var tutorUpdateData = {
            postcode: req.body.user.postcode,
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

//Fetch all Units/Languages available. Useful for Applyform and others
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
