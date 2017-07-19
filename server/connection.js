var mysql = require('mysql');
var config = require(__dirname + '/config');

var connection;

var query = function(queryString, args, callback) {
  if (connection) {
    connection.query(queryString, args, callback);

  } else {
    connection = mysql.createConnection(config.mysqlSettings);
    connection.connect(function(error) {
      if (error) {
        console.log('\033[31m' + 'ERROR: ' + '\033[00m' + 'Failed to connect to mysql database');
        console.log(error);
        callback.apply(this, [error]);
      } else {
        console.log('Connected to mysql database');
        connection.query(queryString, args, callback);
      }
    });
  }
  //console.log(connection);
};

module.exports = {
  query: query,
};
