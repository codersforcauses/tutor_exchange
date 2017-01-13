var express     = require('express');
var mysql       = require('mysql');
var router      = express.Router();
var path        = require('path');

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

app.use(express.static(path.join(__dirname, '..')));

var connection = mysql.createConnection(config.mysqlSettings);

connection.connect (function(error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log('Connected');
  }
});

app.use('/auth/test',function(req,res) {
  connection.query('SELECT * from testtable', function(err, rows, fields) {
        connection.end();
        if (err) {
          res.send(err);
        } else {
          res.send(rows);
        }
        return;
      });
});

app.listen(config.server.port,function() {
  console.log('Live at Port ' + config.server.port);
});
