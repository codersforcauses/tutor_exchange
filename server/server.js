var express     = require('express');
var bodyParser  = require('body-parser');

var config = require(__dirname + '/config');

// Importing modules
var auth = require(__dirname + '/auth');
var data = require(__dirname + '/data');
var profile = require(__dirname + '/profile');
var search = require(__dirname + '/search');
var session = require(__dirname + '/session');
var confirmation = require(__dirname + '/confirmation');
var password = require(__dirname + '/password');


var app = express();
app.use(bodyParser.json()); //read json
app.use(bodyParser.urlencoded({extended: true})); //read data sent in url


// middleware
app.use('/*', function(req, res, next) {
  console.log(req.method + ' ' + req.originalUrl);
  next();
});


// static routing
if (config.devOptions.serveStatic) {
  app.use(express.static(__dirname + '/../app'));
  app.use('/bower_components', express.static(__dirname + '/../bower_components'));
  // For SEO
  app.use('/robots.txt', express.static(__dirname + '/../app/robots.txt'));
  app.use('/sitemap.xml', express.static(__dirname + '/../app/sitemap.xml'));
}


// routing
app.use('/auth/login', auth.login);
app.use('/auth/register', auth.register);
app.use('/auth/upgrade', auth.upgrade);
app.use('/auth/me', auth.me);

app.use('/api/data/units', data.getUnits);
app.use('/api/data/languages', data.getLanguages);

app.use('/api/getprofile', profile.get);
app.use('/api/updateprofile', profile.update);

app.use('/api/search', search.search);

app.use('/api/session/get_requests', session.getRequests);
app.use('/api/session/get_appointments', session.getAppointments);
app.use('/api/session/get_open_sessions', session.getOpenSessions);
app.use('/api/session/create_request', session.createRequest);
app.use('/api/session/accept_request', session.acceptRequest);
app.use('/api/session/reject_request', session.rejectRequest);
app.use('/api/session/cancel_appointment', session.cancelAppointment);
app.use('/api/session/close_session', session.closeSession);
app.use('/api/session/appeal_session', session.appealSession);

app.use('/emailVerify', confirmation.emailVerify);
app.use('/api/mail/sendVerifyEmail', confirmation.sendVerifyEmail);

app.use('/api/who/get_name', search.getName);

app.use('/auth/forgotPassword', password.forgotPassword);
app.use('/auth/resetPassword', password.resetPassword);
app.use('/auth/changePassword', password.changePassword);


// redirecting unknown urls
app.use('/', function(req, res) {
  res.redirect('/#!/');
});


// Serve
app.listen(config.server.port, function() {
  console.log('Live at http://localhost:' + config.server.port);
});

