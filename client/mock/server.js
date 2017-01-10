var express     = require('express');
var mysql       = require('mysql');
var router      = express.Router();
var path        = require('path');
/*var jsonServer  = require('json-server');*/
/*var jwt         = require('jsonwebtoken');

var config      = require(__dirname + '/config');

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

/*You will need to change this*/
var connection = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'testdb',
  });

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

app.listen(8080,function() {
  console.log('Live at Port 443');
});
