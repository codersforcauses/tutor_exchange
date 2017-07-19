var connection = require(__dirname + '/connection');

var getUnits = function(req, res) {
  connection.query('SELECT * FROM unit;', [], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Database error: cannot get units.');
      return;
    }
    res.json(result);
  });
};
var getLanguages = function(req, res) {
  connection.query('SELECT * FROM language;', [], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Database error: cannot get languages.');
      return;
    }
    res.json(result);
  });
};

module.exports = {
  getUnits: getUnits,
  getLanguages: getLanguages,
};
