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

    // Delete user 12345678 if it exists (hopefull no one has this id)
    beforeAll(function(done) {
      connection.query('DELETE FROM user WHERE userID = ?', [fakeUser.userID], function(err) {
        if (!!err) console.log(err);
        done();
      });
    });

    // Section 1: fake user present
    describe('', function() {
      // Insert fake user before tests
      beforeEach(function(done) {
        connection.query('INSERT INTO user SET ?', [fakeUser], function(err) {
          if (!!err) console.log(err);
          done();
        });
      });

      // Now remove fake user
      afterEach(function(done) {
        connection.query('DELETE FROM user WHERE userID = ?', [fakeUser.userID], function(err) {
          if (!!err) console.log(err);
          done();
        });
      });

      // Check fake user no longer exists
      it('should return 1 when user ' + fakeUser.userID + ' exists', function(done) {
        connection.query('CALL userExists(?)', [fakeUser.userID], function(err, rows, fields) {
          var exists = rows[0][0].exists;
          expect(exists).toBe(1);
          done();
        });
      });

    });

    // Section 2: fake user not present
    describe('', function() {
      // Check fake user no longer exists
      it('should return 0 when user ' + fakeUser.userID + ' doesn\'t exist', function(done) {
        connection.query('CALL userExists(?)', [fakeUser.userID], function(err, rows, fields) {
          var exists = rows[0][0].exists;
          expect(exists).toBe(0);
          done();
        });
      });
    });

  });


  // ---------------------------------------- //
  // createUser(userID, firstName, lastName, DOB, sex, phone, passwordHash, passwordSalt) TEST
  describe('createUser(userID, firstName, lastName, DOB, sex, phone, passwordHash, passwordSalt)', function() {

    // Delete user 12345678 if it exists (hopefull no one has this id)
    beforeAll(function(done) {
      connection.query('DELETE FROM user WHERE userID = ?', [fakeUser.userID], function(err) {
        if (!!err) console.log(err);
        done();
      });
    });

    // Now create user using createUser stored procedure
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

    // Remember to remove it again when tests are finished
    afterAll(function(done) {
      connection.query('DELETE FROM user WHERE userID = ?', [fakeUser.userID], function(err) {
        if (!!err) console.log(err);
        done();
      });
    });

    // Section 1: Check user is created properly
    describe('', function() {
      // Check fake user was added
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
    });

    // Section 2: Try adding user with same id to database
    describe('', function() {
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

      // mysql should throw an error when inserting with the same key
      it('should throw error if user is added with same userID', function() {
        expect(errorFlag).toBe(true);
      });

      // Again, keys should be unique
      it('should result in only one user in table with userID = ' + fakeUser.userID, function(done) {
        connection.query('SELECT COUNT(*) FROM user WHERE userID = ?', [fakeUser.userID], function(err, rows, fields) {
          expect(rows[0]['COUNT(*)']).toBe(1);
          done();
        });
      });

      // Check we didn't just overwrite existing user
      it('should not overwrite user if user already exists', function(done) {
        connection.query('SELECT firstName FROM user WHERE userID = ?', [fakeUser.userID], function(err, rows, fields) {
          expect(rows[0].firstName).toBe(fakeUser.firstName);
          done();
        });
      });
    });

  });


  // ---------------------------------------- //
  // getUser(userID)
  describe('getUser(userID)', function() {

    //Section 1: test when user exists
    describe('', function() {
      // Insert fake user before tests
      beforeAll(function(done) {
        connection.query('INSERT INTO user SET ?', [fakeUser], function(err) {
          if (!!err) console.log(err);
          done();
        });
      });

      // Clean up when done
      afterAll(function(done) {
        connection.query('DELETE FROM user WHERE userID = ?', [fakeUser.userID], function(err) {
          if (!!err) console.log(err);
          done();
        });
      });

      // Check procedure returns correct user
      // Not checking fields filled with default values
      it('should return user info', function(done) {
        connection.query('CALL getUser(?)', [fakeUser.userID], function(err, rows, fields) {
          expect(rows[0].length).toBe(1);

          var returnedObject = rows[0][0];
          expect(returnedObject).toBeDefined();
          expect(returnedObject.userID).toBe(fakeUser.userID);
          expect(returnedObject.firstName).toBe(fakeUser.firstName);
          expect(returnedObject.lastName).toBe(fakeUser.lastName);
          expect(Date(returnedObject.DOB)).toBe(Date(fakeUser.DOB));
          expect(returnedObject.sex).toBe(fakeUser.sex);
          expect(returnedObject.phone).toBe(fakeUser.phone);
          expect(returnedObject.passwordHash).toBe(fakeUser.passwordHash);
          expect(returnedObject.passwordSalt).toBe(fakeUser.passwordSalt);
          done();
        });
      });
    });

    //Section 2: test when user doesn't exist
    describe('', function() {
      // Table should be empty if user doesn't exist
      it('should return empty table when user does not exist', function(done) {
        connection.query('CALL getUser(?)', [fakeUser.userID], function(err, rows, fields) {
          expect(rows[0].length).toBe(0);

          var returnedObject = rows[0][0];
          expect(returnedObject).not.toBeDefined();
          done();
        });
      });
    });

  });



});
