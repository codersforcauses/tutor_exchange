var mysql       = require('mysql');
var config      = require(__dirname + '/config');


var fakeUser = {
  userID: 12345678,
  firstName: 'John',
  lastName: 'Smith',
  DOB: '1990-01-01',
  sex: 'M',
  phone: '0432000111',
  passwordHash: 'hash',
  passwordSalt: 'salt',
};


describe('Procedures unit tests:', function() {
  var success;
  var connection;

  beforeAll(function(done) {
    successFlag = false;
    connection = mysql.createConnection(config.mysqlSettings);
    connection.connect(function(err) {
      if (!!err) {
        console.log(err);
      } else {
        successFlag = true;
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
      expect(successFlag).toBe(true);
    });
  });


  // ---------------------------------------- //
  // userExists(userID) TESTS
  describe('userExists(userID)', function() {
    beforeAll(function(done) {
      // Insert example user
      connection.query('INSERT INTO user SET ?', [fakeUser], function(err) {
        if (!!err) console.log(err);
        done();
      });
    });

    afterAll(function(done) {
      // Remove example user
      connection.query('DELETE FROM user WHERE userID = ?', [fakeUser.userID], function(err) {
        if (!!err) console.log(err);
        done();
      });
    });


    it('should return 1 when user ' + fakeUser.userID + ' exists', function(done) {
      connection.query('CALL userExists(?)', [fakeUser.userID], function(err, rows, fields) {
        var exists = rows[0][0].exists;
        expect(exists).toBe(1);
        done();
      });
    });

    it('should return 0 when user ' + (fakeUser.userID + 1) + ' doesn\'t exist', function(done) {
      connection.query('CALL userExists(?)', [fakeUser.userID+1], function(err, rows, fields) {
        var exists = rows[0][0].exists;
        expect(exists).toBe(0);
        done();
      });
    });
  });


  // ---------------------------------------- //
  // createUser(userID, firstName, lastName, DOB, sex, phone, passwordHash, passwordSalt) TEST
  describe('createUser(userID, firstName, lastName, DOB, sex, phone, passwordHash, passwordSalt)', function() {
    beforeAll(function(done) {
      connection.query(
        'CALL createUser(?, ?, ?, ?, ?, ?, ?, ?)',
        [
          fakeUser.userID,
          fakeUser.firstName,
          fakeUser.lastName,
          fakeUser.DOB,
          fakeUser.sex,
          fakeUser.phone,
          fakeUser.passwordHash,
          fakeUser.passwordSalt,
        ],
        function(err) {
          if (!!err) console.log(err);
          done();
        }
      );
    });

    afterAll(function(done) {
      connection.query('DELETE FROM user WHERE userID = ?', [fakeUser.userID], function(err) {
        if (!!err) console.log(err);
        done();
      });
    });

    it('should add user to database', function(done) {
      connection.query('SELECT * FROM user WHERE userID = ?', [fakeUser.userID], function(err, rows, fields) {
        if (!!err) console.log(err);
        var newUser = rows[0];
        expect(newUser.userID).toBe(fakeUser.userID);
        expect(newUser.firstName).toBe(fakeUser.firstName);
        expect(newUser.lastName).toBe(fakeUser.lastName);
        expect(Date(newUser.DOB)).toBe(Date(fakeUser.DOB));
        expect(newUser.sex).toBe(fakeUser.sex);
        expect(newUser.phone).toBe(fakeUser.phone);
        expect(newUser.passwordHash).toBe(fakeUser.passwordHash);
        expect(newUser.passwordSalt).toBe(fakeUser.passwordSalt);
        done();
      });
    });

    // Try adding user with same id to database
    var secondUser = {firstName: 'BOB'};
    var errorFlag = false;
    beforeEach(function(done) {
      connection.query(
        'CALL createUser(?, ?, ?, ?, ?, ?, ?, ?)',
        [
          fakeUser.userID,
          secondUser.firstName,
          fakeUser.lastName,
          fakeUser.DOB,
          fakeUser.sex,
          fakeUser.phone,
          fakeUser.passwordHash,
          fakeUser.passwordSalt,
        ],
        function(err) {
          if (!!err) errorFlag = true;
          done();
        }
      );
    });

    it('should throw error if user is added with same userID', function() {
      expect(errorFlag).toBe(true);
    });

    it('should result in only one user in table with userID = ' + fakeUser.userID, function(done) {
      connection.query('SELECT COUNT(*) FROM user WHERE userID = ?', [fakeUser.userID], function(err, rows, fields) {
        expect(rows[0]['COUNT(*)']).toBe(1);
        done();
      });
    });

    it('should not overwrite user if user already exists', function(done) {
      connection.query('SELECT firstName FROM user WHERE userID = ?', [fakeUser.userID], function(err, rows, fields) {
        expect(rows[0].firstName).toBe(fakeUser.firstName);
        done();
      });
    });

  });




});
