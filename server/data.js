var connection = require(__dirname + '/connection');

module.exports.getUnits = function(req, res) {
  connection.query('SELECT * FROM unit;', [], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Database error: cannot get units.');
      return;
    }
    res.json(result);
  });
};

module.exports.getLanguages = function(req, res) {
  connection.query('SELECT * FROM language;', [], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Database error: cannot get languages.');
      return;
    }
    res.json(result);
  });
};
