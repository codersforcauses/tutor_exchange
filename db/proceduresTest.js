var mysql       = require('mysql');
var config      = require(__dirname + '/config');



describe('Database connection:', function() {
  var success;
  var connection;

  beforeEach(function(done) {
    success = jasmine.createSpy('MYSQL CONNECTION SUCCESS');
    connection = mysql.createConnection(config.mysqlSettings);
    connection.connect(function(err) {
      if (!!err) {
        console.log(err);
      } else {
        success();
      }
      done();
    });
  });

  afterEach(function(done) {
    connection.end();
    done();
  });

  it('should connect to database', function() {
    expect(success).toHaveBeenCalled();
  });

});

