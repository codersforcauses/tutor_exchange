var express     = require('express');
var jsonServer  = require('json-server');
var jwt         = require('jwt-simple');
var low         = require('lowdb');
var path        = require('path');

var config      = require(__dirname + '/config');

var server = jsonServer.create();
server.use(jsonServer.bodyParser);
server.set('secret', config.secret);

var db = low(path.join(__dirname, 'db.json'));
if (!db.has('users').value()) bd.set('users, []').value();



var router = jsonServer.router(path.join(__dirname, 'db.json'));

server.use('/auth/login', function(req, res) {
  login(req, res);
});

server.use('/auth/register', function(req, res) {
  register(req, res);
});

server.use(express.static(path.join(__dirname, '..')));
server.use(jsonServer.defaults());
server.use(jsonServer.rewriter({'/db': '/api/db'}));

server.use(function(req, res, next) {
  if (req.originalUrl === '/db') {
    next();
  } else if (isAutherised(req)) {
    next();
  } else {
    res.sendStatus(401);
  }
});

server.use('/api', router);

var port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log('\nMock server is running on http://localhost:' + port + '/\n');
});



isAutherised = function(req) {
  var token;

  try {
    token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token'];
  } catch (err) {
    return false;
  }

  if (token) {
    try {
      var decoded = jwt.decode(token, server.get('secret'));
      console.log(decode.iss + 'is autherised');
      return true;
    } catch (err) {
      console.log('token no good');
      return false;
    }
  }

  return false;
};


login = function(req, res) {

  var user = req.body.user;

  if (!user || !user.id || !user.password) {
    res.json({success: false});
    return;
  }

  if (!db.get('users').find({'id': user.id}).value()) {
    res.json({success: false});
    return;
  }

  if (user.password !== db.get('users').find({'id': user.id}).value().password) {
    res.json({success: false});
    return;
  }


  //var user = {'id': 12345678, 'password': 'password'};

  var token = jwt.encode({iss: user.id}, server.get('secret'));

  res.json({success: true, token: token});

};

register = function(req, res) {
/*
  var user = req.body.user;

  if (!user || !user.id || !user.password || !user.name) {
    res.json({success: false});
    return;
  }

*/

  var user = {'id': 11112222, 'password': 'password', 'name': 'Hugh Jass'};

  if (db.get('users').find({'id': user.id}).value()) {
    res.json({success: false});
    return;
  }

  db.get('users').push(user).value();

  var token = jwt.encode({iss: user.id}, server.get('secret'));

  res.json({success: true, token: token});

};
