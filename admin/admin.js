var express = require('express');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');
var request = require('request');


var config = require(__dirname + '/config');

// Init express
var app = express();

// Init handlebars template engine
app.engine('hbs', handlebars({
  extname: '.hbs',
  layoutsDir: 'templates/layouts/',
  defaultLayout: 'layout',
  helpers: {
    plural: function(n) {return n===1 ? '' : 's';},
  },
}));
app.set('view engine', 'hbs');
app.set('views', 'templates/');

// Init body parser for reading messages from client
app.use(bodyParser.json());
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

// Serve public folder
app.use(express.static('public'));


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
  res.render('login', {layout: 'layout_login'});
});

//Adapted from: https://codeforgeek.com/2016/03/google-recaptcha-node-js-tutorial/
app.post('/auth/login', function(req, res) {

  if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    res.status(400).render('login', {layout: 'layout_login', errMsg: 'CAPTCHA was not provided'});
    return;
  }
  var secretKey = config.captcha.secretkey;
  var verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + req.body['g-recaptcha-response'] + '&remoteip=' + req.connection.remoteAddress;
  request(verificationUrl,function(error,response,body) {
    if (req.body.success !== undefined && !req.body.success) {
      res.status(400).render('login', {layout: 'layout_login', errMsg: 'CAPTCHA was incorrect'});
      return;
    }

    if (!req.body.username || !req.body.password) {
      res.status(400).render('login', {layout: 'layout_login', errMsg: 'User name or password not provided'});
      return;
    }

    if (req.body.username != config.admin.username || req.body.password != config.admin.password) {
      res.status(400).render('login', {layout: 'layout_login', errMsg: 'Incorrect username or password'});
      return;
    }

    req.session.authorised = true;
    res.redirect('/');
  });

});

app.all('/auth/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/login');
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

  if (approved.length === 0) {
    res.redirect('/approve');
    return;
  }

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

  //console.log(sessionID + ' ' + userID + ' ' + hoursAwarded);

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

  if (!req.body.query || req.body.query.trim().length < 1) {
    res.render('search');
    return;
  }

  var pattern = req.body.query.match(/[^ ]+/g).join('|');

  if (pattern.length < 1) {
    res.render('search');
    return;
  }

  db.query('SELECT userID, firstName, lastName, phone FROM user WHERE userID REGEXP ? OR firstName REGEXP ? OR lastName REGEXP ?;', [pattern, pattern, pattern], function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }

    if (results.length === 0) {
      res.render('search', {errMsg: 'No results found.'});
      return;
    }

    res.render('search', {users: results});
  });
});


//----------------------------------------
// Banned users
//----------------------------------------
app.get('/banned', function(req, res) {
  db.query('SELECT userID, firstName, lastName, reason FROM user JOIN bannedUser USING (userID);', function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    res.render('banned', {bannedUsers: results, scripts: ['banned.js']});
  });
});


app.post('/api/banned/search', function(req, res) {
  var userID = parseInt(req.body.userID);

  if (!userID || userID < 1 || 99999999 < userID) {
    res.json({success: false, message: 'Please enter an 8 digit student number.'});
    return;
  }

  db.query('SELECT userID, firstName, lastName FROM user WHERE userID = ?;', [userID], function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }

    if (results.length === 0) {
      res.json({success: false, message: 'Student number does not belong to any users.'});
      return;
    }

    res.json({success: true, user: results[0]});
    return;
  });

});

app.post('/api/banned/ban', function(req, res) {
  var userID = req.body.userID;
  var reason = req.body.reason || '';

  db.query('INSERT IGNORE INTO bannedUser VALUES (?, ?);', [userID, reason], function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    res.redirect('/banned');
  });
});

app.post('/api/banned/reinstate', function(req, res) {
  var reinstated = Object.keys(req.body);
  //console.log(reinstated);

  if (reinstated.length === 0) {
    res.redirect('/banned');
    return;
  }

  db.query('DELETE FROM bannedUser WHERE userID IN (?);', [reinstated], function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    res.redirect('/banned');
  });
});


//----------------------------------------
// Generate report for guild volunteering
//----------------------------------------
app.get('/report', function(req, res) {
  res.render('report', {scripts: ['report.js']});
});

app.post('/api/report', function(req, res) {

  var query = 'SELECT userID, firstName, lastName, MIN(time) AS start, MAX(time) AS end, SUM(hoursAwarded) AS hours FROM user JOIN session ON user.userID = session.tutor GROUP BY userID;';

  db.query(query, function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }

    res.json({data: results});
    return;
  });
});


//----------------------------------------
// Default route to home
//----------------------------------------
app.use('/', function(req, res) {
  db.query('SELECT * FROM (SELECT COUNT(*) AS pending FROM tutor WHERE verified = 0) AS A JOIN (SELECT COUNT(*) AS appeals FROM sessionComplaint WHERE resolved = 0) AS B;', function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }

    res.render('home', {summary: results[0]});
  });
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

