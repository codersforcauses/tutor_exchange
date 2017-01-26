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
      res.json({success: true, message: 'pls'});
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





app.use('/auth/login', function(req, res) {
  login(req, res);
});


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

