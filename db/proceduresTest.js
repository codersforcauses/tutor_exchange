var mysql       = require('mysql');
var config      = require(__dirname + '/config');


var fakeUser = {
  userID: 12345678,
  firstName: 'John',
  lastName: 'Smith',
  DOB: '1990-01-01',
  sex: 'M',
  phone: 0432000111,
  passwordHash: 'password',
  passwordSalt: 'salt',
};


describe('Procedures unit tests:', function() {
  var success;
  var connection;

  beforeAll(function(done) {
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

  afterAll(function(done) {
    connection.end(function() {
      done();
    });
  });

  // ---------------------------------------- //
  // MYSQL CONNECTION TEST
  describe('Mysql connection', function() {
    it('should connect to database', function() {
      expect(success).toHaveBeenCalled();
    });
  });


  // ---------------------------------------- //
  // userExists(userID) TESTS
  describe('userExists(userID)', function() {
    beforeAll(function(done) {
      // Insert example user
      connection.query('INSERT INTO user SET ?', fakeUser, function(err) {
        if (!!err) console.log(err);
        done();
      });
    });

    afterAll(function(done) {
      // Remove example user
      connection.query('DELETE FROM user WHERE userID = ?', fakeUser.userID, function(err) {
        if (!!err) console.log(err);
        done();
      });
    });


    it('should return 1 when user ' + fakeUser.userID + ' exists', function(done) {
      connection.query('CALL userExists(?)', fakeUser.userID, function(err, rows, fields) {
        var exists = rows[0][0].exists;
        expect(exists).toBe(1);
        done();
      });
    });

    it('should return 0 when user ' + (fakeUser.userID + 1) + ' doesn\'t exist', function(done) {
      connection.query('CALL userExists(?)', fakeUser.userID+1, function(err, rows, fields) {
        var exists = rows[0][0].exists;
        expect(exists).toBe(0);
        done();
      });
    });
  });



});
