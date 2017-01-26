var express     = require('express');
var mysql       = require('mysql');
var router      = express.Router();
var path        = require('path');

var bodyParser  = require('body-parser');

var config      = require(__dirname + '/config');
/*var jsonServer  = require('json-server');*/
/*var jwt         = require('jsonwebtoken');



var REQUIRE_AUTH = true;*/


var app = express();
/*var server = jsonServer.create();
server.use(jsonServer.bodyParser);
server.set('secret', config.secret);*/

router.use(function(req,res,next) {
  console.log('/' + req.method);
  next();
});

app.use('/',router);
app.use(express.static(path.join(__dirname, '../app')));
app.use('/bower_components', express.static(path.join(__dirname, '../bower_components')));
var connection = mysql.createConnection(config.mysqlSettings);

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


connection.connect (function(error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log('Connected');
  }
});


app.use('/auth/register', function(req, res) {

  var post  = {
    studentNumber: req.body.user.id,
    sex: req.body.user.sex,
    name: req.body.user.name,
    DOB: req.body.user.DOB,
    phone: req.body.user.phone,
    password: req.body.user.password,
  };
  connection.query('INSERT INTO user SET ?', post, function(err, rows, fields) {
    if (err) {
      res.send(err);
    } else {
      res.json({success: true, message: 'Registration was Successful'});
    }
    return;
  });
});

app.use('/auth/login', function(req, res) {
  var details = {
    studentNumber: req.body.user.id,
    password: req.body.user.password,
  };
  var query = connection.query('SELECT COUNT(*) AS count FROM user WHERE studentNumber = ? and password = ?', [details.studentNumber, details.password], function(err, rows, fields) {
    if (err) {
      res.send(err);
    } else if (rows[0].count === 1) {
      res.json({success: true, message: 'Login was Successful'});
    }
    return;
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


//app.get('/auth/register', function(req, res){
//  register(req, res);
//});

app.listen(config.server.port,function() {
  console.log('Live at Port ' + config.server.port);
});

