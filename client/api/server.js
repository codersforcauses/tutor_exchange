var express     = require('express');
var bodyParser  = require('body-parser');
var mysql       = require('mysql');
//var jwt         = require('jsonwebtoken');

var config      = require(__dirname + '/config');



var app = express();
app.use(bodyParser.json()); //read json
app.use(bodyParser.urlencoded({extended: true})); //read data sent in url
//app.set('secret', config.secret);*/


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

  var post = {
    studentNumber: req.body.user.id,
    sex: req.body.user.sex,
    name: req.body.user.name,
    DOB: '2000-01-01',//req.body.user.DOB,
    phone: req.body.user.phone,
    password: req.body.user.password,
    passwordHash: 'hash',
  };

  connection.query('SELECT * FROM user WHERE studentNumber = ?', post.studentNumber, function(err, rows, fields) {
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
        res.json({success: true, message: 'Registration was Successful', name: post.name, role: 'student'});

      } else {
        var tutorpost = {
          userID: req.body.user.id,
          postcode: req.body.user.postcode,
          // accountType: 1, //Set as pendingTutor
        };
        console.log(tutorpost);

        connection.query('INSERT INTO tutor SET ?', tutorpost, function(err, rows, fields) {
          if (err) {
            console.log(err);
            res.status(503).send(err);
            return;
          }

          res.json({success: true, message: 'Registration was Successful', name: post.name, role: 'pendingTutor'});
          return;
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

  connection.query('SELECT name FROM user WHERE studentNumber = ? and password = ?', [details.studentNumber, details.password], function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    if (!rows) {
      res.json({success: false, message: 'Username or Password was Incorrect'});
      return;
    }

    //console.log(rows);

    var name = rows[0].name;

    connection.query('SELECT userid, verified FROM tutor WHERE studentNumber = ?', [details.studentNumber], function(err, rows, fields) {
      //console.log(rows);

      if (!rows) {
        res.json({success: true, message: 'Login was Successful', name: name, role: 'student'});
        return;
      }

      if (rows[0].verified) {
        res.json({success: true, message: 'Login was Successful', name: name, role: 'tutor'});
        return;
      }

      res.json({success: true, message: 'Login was Successful', name: name, role: 'pendingTutor'});
    });
  });
});


app.use('/auth/test',function(req,res) {
  connection.query('SELECT name from user where sex = "M"', function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.status(503).send(err);
      return;
    }

    res.send(rows);
  });
});


// Serve
app.listen(config.server.port, function() {
  console.log('Live at http://localhost:' + config.server.port);
});

