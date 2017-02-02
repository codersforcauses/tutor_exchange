'use strict';
var express     = require('express');
var mysql       = require('mysql');
var router      = express.Router();
var path        = require('path');

var bodyParser  = require('body-parser');

var config      = require(__dirname + '/config');

var crypto = require('crypto');
/*var jsonServer  = require('json-server');*/
/*var jwt         = require('jsonwebtoken');



var REQUIRE_AUTH = true;*/


var app = express();
/*var server = jsonServer.create();
server.use(jsonServer.bodyParser);
server.set('secret', config.secret);*/

/** [from https://code.ciphertrick.com/2016/01/18/salt-hash-passwords-using-nodejs-crypto/]
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};
/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};
function saltHashPassword(userpassword) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    console.log(typeof salt);
    var passwordData = sha512(userpassword, salt);
    /*console.log('UserPassword = '+userpassword);
    console.log('Passwordhash = '+passwordData.passwordHash);
    console.log('\nSalt = '+passwordData.salt);*/
    return passwordData;
};

router.use(function(req,res,next) {
  console.log('/' + req.method);
  next();
});

app.use('/',router);
app.use(express.static(path.join(__dirname, '../app')));
app.use('/bower_components', express.static(path.join(__dirname, '../bower_components')));
var connection = mysql.createConnection(config.mysqlSettings);

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


connection.connect (function(error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log('Connected');
  }
});


app.use('/auth/register', function(req, res) {
  var passhashsalt = saltHashPassword(req.body.user.password);
  var post  = { //this whole section may require tweaking based on your personal db setup
    studentNumber: req.body.user.id,
    studentEmail: req.body.user.id.toString() + '@student.uwa.edu.au',
    name: req.body.user.name,
    //lastName: 'irrelephant',
    DOB: req.body.user.DOB,
    sex: req.body.user.sex,
    phone: req.body.user.phone, //currently doesn't work
    password: req.body.user.password,
    passwordHash: passhashsalt.passwordHash,
    salt: passhashsalt.salt,
    //accountType: 0,
  };

  connection.query('SELECT * FROM user WHERE studentNumber = ?', post.studentNumber, function(err, rows, fields) {
    if (err) {
      res.send(err);
    } else if (rows.length !== 0) {
          res.json({success: false, message: 'User already Exists'});
    } else {
      connection.query('INSERT INTO user SET ?', post, function(err, rows, fields) {
        if (err) {
          res.send(err);
        } else {
          res.json({success: true, message: 'Registration was Successful'});
        }
        return;
      });
    }
  });

});

app.use('/auth/login', function(req, res) {
  var userSalt;
  var userHash;
  var details = {
    studentNumber: req.body.user.id,
    password: req.body.user.password,
  };
  //check if user exists to obtain salt
  connection.query('SELECT * FROM user WHERE studentNumber = ?', details.studentNumber, function(err, rows, fields)  {
    if (err) {
      res.send(err);
      return;
    } else if (rows[0].studentNumber !== details.studentNumber) {
      res.json({success: false, message: 'idk what goes here'}); //help pls i don't know what I'm doing
    } else {
        //get salt and hash from db
        userSalt = rows[0].salt;
        userHash = rows[0].passwordHash;
        var inputHashData = sha512(details.password, userSalt); //PROBLEM HERE

        var query = connection.query('SELECT COUNT(*) AS count FROM user WHERE studentNumber = ? and passwordHash = ?', [details.studentNumber, inputHashData.passwordHash], function(err, rows, fields) {
          if (err) {
            res.send(err);
          } else if (rows[0].count === 1) {
            res.json({success: true, message: 'Login was Successful'});
          }
          return;
        });
    };
  });
});

app.use('/auth/test',function(req,res) {
  connection.query('SELECT name from user where sex = "M"', function(err, rows, fields) {
        if (err) {
          res.send(err);
        } else {
          res.send(rows);
        }
        return;
      });
});





/*app.use('/auth/login', function(req, res) {
  login(req, res);
});*/


//app.get('/auth/register', function(req, res){
//  register(req, res);
//});

app.listen(config.server.port,function() {
  console.log('Live at Port ' + config.server.port);
});


// register = function(req, res) {

//   var user = req.body.user;

//   if (!user || !user.id || !user.password || !user.name) {
//     res.json({success: false, message: 'User id, password or name not submitted'});
//     return;
//   }

//   //var user = {'id': 11112222, 'password': 'password', 'name': 'Hugh Jass'};

//   if (db.get('users').find({'id': user.id}).value()) {
//     res.json({success: false, message: 'User already exists'});
//     return;
//   }

//   db.get('users').push(user).value();
//   //router.db.read(path.join(__dirname, 'db.json'));

//   var token = jwt.sign(String(user.id), server.get('secret'));
//   res.json({success: true, name: user.name, role: 'student', token: token});
// };

