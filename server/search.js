var connection = require(__dirname + '/connection');
var tm = require(__dirname + '/tokenManager');
var USER_ROLES = require(__dirname + '/userRoles');


var search = function(req, res) {
  var user = tm.getUser(req);

  // No token = no search
  if (!user) {
    res.status(401).send('Please log in to search profiles');
    return;
  }

  // pendingUsers aren't allowed to search
  if (user.role != USER_ROLES.student || user.role != USER_ROLES.pendingTutor || user.role != USER_ROLES.tutor) {
    res.json({success: false});
    return;
  }

  var unit = req.body.query.units || '';
  var language = req.body.query.language || '';

  connection.query('CALL searchTutors(?, ?);', [unit, language], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    var results = [];

    rows[0].forEach(function(row) {
      var tutor = {
        studentNumber: row.userID,
        name: row.firstName + ' ' + row.lastName,
        phone: row.phone,
        bio: row.bio,
        units: row.unitID.split(','),
        languages: row.languageName.split(','),
      };

      results.push(tutor);
    });

    res.json(results);
  });
};


var getName = function(req, res) {
  var user = tm.getUser(req);

  // No token = no search
  if (!user) {
    res.status(401).send('Please log in to search profiles');
    return;
  }

  if (user.role !== USER_ROLES.tutor && user.role !== USER_ROLES.admin) {
    res.status(403).send('You don\'t have the authority.');
    return;
  }

  if (!req.body || !req.body.userID) {
    res.status(400).send('userID not supplied');
    return;
  }

  connection.query('CALL getUser(?);', [req.body.userID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (rows[0].length === 0) {
      res.json({userDoesNotExist: true});
      return;
    }

    var user = {
      firstName: rows[0][0].firstName,
      lastName: rows[0][0].lastName,
    };

    res.json(user);
  });
};


module.exports = {
  search: search,
  getName: getName,
};
