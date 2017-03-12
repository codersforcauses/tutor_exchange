var express = require('express');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');

var config = require(__dirname + '/config');

// Init express
var app = express();

// Init handlebars template engine
app.engine('hbs', handlebars({extname: '.hbs', layoutsDir: 'templates/layouts/', defaultLayout: 'main'}));
app.set('view engine', 'hbs');
app.set('views', 'templates/');

// Init body parser for reading messages from client
app.use(bodyParser.urlencoded({extended: true}));

// Init session cookie library
app.use(session({secret: config.secret, resave: false, saveUninitialized: true, cookie: {secure: config.devOptions.https},}));

// Init mysql database
var db = mysql.createConnection(config.mysqlSettings);
db.connect (function(error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log('Connected to mysql database');
  }
});


// Middleware
app.use('/*', function(req, res, next) {
  if (req.originalUrl === '/login' || req.originalUrl === '/auth/login') {
    next();
  } else if (isAuth(req)) {
    next();
  } else {
    res.status(400).redirect('/login');
  }
});



//----------------------------------------
// Login + logout
//----------------------------------------
app.get('/login', function(req, res) {
  res.render('login', {layout: 'plain'});
});

app.post('/auth/login', function(req, res) {

  if (!req.body.username || !req.body.password) {
    res.status(400).render('login', {layout: 'plain', errMsg: 'User name or password not provided'});
    return;
  }

  if (req.body.username != config.admin.username || req.body.password != config.admin.password) {
    res.status(400).render('login', {layout: 'plain', errMsg: 'Incorrect username or password'});
    return;
  }

  req.session.authorised = true;
  res.redirect('/');

});

app.all('/auth/logout', function(req, res) {
  req.session.destroy();
  res.status(200).redirect('/login');
});


//----------------------------------------
// Approve pending tutors
//----------------------------------------


app.get('/approve', function(req, res) {
  db.query('SELECT user.userID, firstName, lastName, phone FROM user JOIN tutor ON user.userID = tutor.userID WHERE verified = 0;', function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    res.render('approve', {pendingTutors: results});
  });
});

app.post('/api/approve', function(req, res) {

  var approved = Object.keys(req.body);
  //console.log(approved);

  db.query('UPDATE tutor SET verified=1 WHERE userID IN (?);', [approved], function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    res.redirect('/approve');
  });
});



app.use('/', function(req, res) {
  res.render('home');
});




app.listen(config.server.port, function() {
  console.log('server running on http://localhost:' + config.server.port);
});



function isAuth(req) {
  return !!req.session.authorised;
}

