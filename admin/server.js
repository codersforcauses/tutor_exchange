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


//----------------------------------------
// Resolve session appeals
//----------------------------------------
app.get('/appeals', function(req, res) {
  db.query('SELECT sessionID, time, userID, firstName, lastName, reason, hoursAwarded FROM user JOIN sessionComplaint USING (userID) JOIN session USING (sessionID) WHERE resolved = 0;', function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    res.render('appeals', {appeals: results});
  });
});


app.post('/api/appeals/resolve', function(req, res) {
  var keys = Object.keys(req.body)[0].split(' ');
  var sessionID = keys[0];
  var userID = keys[1];
  var hoursAwarded = req.body[keys.join(' ')] === 'Award' ? 1 : 0;

  console.log(sessionID + ' ' + userID + ' ' + hoursAwarded);

  db.beginTransaction(function(err) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }

    db.query('UPDATE sessionComplaint SET resolved = 1 WHERE sessionID = ? AND userID = ?;', [sessionID, userID], function(err) {
      if (err) {
        return db.rollback(function() {
          console.log(err);
          res.status(500).send(err);
          return;
        });
      }
    });

    db.query('UPDATE session SET hoursAwarded = ? WHERE sessionID = ?;', [hoursAwarded, sessionID], function(err) {
      if (err) {
        return db.rollback(function() {
          console.log(err);
          res.status(500).send(err);
          return;
        });
      }
    });

    db.commit(function(err) {
      if (err) {
        return db.rollback(function() {
          console.log(err);
          res.status(500).send(err);
          return;
        });
      }

      res.redirect('/appeals');
    });
  });
});


//----------------------------------------
// Search user details
//----------------------------------------
app.get('/search', function(req, res) {
  res.render('search');
});


app.post('/api/search', function(req, res) {
  //console.log(req.body);
  var userID = parseInt(req.body.userID);

  if (!userID || userID < 1 || 99999999 < userID) {
    res.render('search', {errMsg: 'Please enter an 8 digit student number.'});
    return;
  }

  db.query('SELECT userID, firstName, lastName, phone FROM user WHERE userID = ?;', [userID], function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }

    if (results.length === 0) {
      res.render('search', {errMsg: 'Student number does not belong to any users.'});
      return;
    }

    res.render('search', {user: results[0]});
  });
});


//----------------------------------------
// Default route to home
//----------------------------------------
app.use('/', function(req, res) {
  res.render('home');
});


//----------------------------------------
// Serve
//----------------------------------------
app.listen(config.server.port, function() {
  console.log('server running on http://localhost:' + config.server.port);
});



function isAuth(req) {
  return !!req.session.authorised;
}

