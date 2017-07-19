var rewire = require('rewire');
var data = rewire(__dirname + '/../data.js');

var mockConnection = {
  error: false,
  units: [{unitID: 'ACCT1101', unitName: 'Financial Accounting'}, {unitID: 'ACCT1112', unitName: 'Management Accounting'}],
  languages: [{languageCode: 'fr', languageName: 'French'}, {languageCode: 'es', languageName: 'Spanish'}],

  query: function(queryString, args, callback) {
    if (!this.error && queryString == 'SELECT * FROM unit;') {
      callback.apply(this, ['', this.units, ['unitID', 'unitName']]);

    } else if (!this.error && queryString) { //== 'SELECT * FROM language;') {
      callback.apply(this, ['', this.languages, ['languageCode', 'languageName']]);

    } else {
      callback.apply(this, ['ERROR', '', '']);
    }
  },
};

var mockConsole = {
  log: function() {},
};

data.__set__('connection', mockConnection);
data.__set__('console', mockConsole);

describe('data.js unit tests:', function() {

  describe('getUnits:', function() {
    var req = {};
    var res = jasmine.createSpyObj('res', ['json', 'status', 'send']);
    res.status.and.returnValue(res);

    describe('when mysql database behaves correctly:', function() {
      it('should call res.json with list of units returned from mysql query', function() {
        data.getUnits(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(mockConnection.units);
      });
    });

    describe('when mysql database throws an error:', function() {
      beforeAll(function() {
        mockConnection.error = true;
      });

      it('should call res.status(500)', function() {
        data.getUnits(req, res);
        expect(res.status).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
      });

      afterAll(function() {
        mockConnection.error = false;
      });
    });
  });

  describe('getLanguages:', function() {
    var req = {};
    var res = jasmine.createSpyObj('res', ['json', 'status', 'send']);
    res.status.and.returnValue(res);

    describe('when mysql database behaves correctly:', function() {
      it('should call res.json with list of languages returned from mysql query', function() {
        data.getLanguages(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(mockConnection.languages);
      });
    });

    describe('when mysql database throws an error:', function() {
      beforeAll(function() {
        mockConnection.error = true;
      });

      it('should call res.status(500)', function() {
        data.getLanguages(req, res);
        expect(res.status).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
      });

      afterAll(function() {
        mockConnection.error = false;
      });
    });
  });

});