var connection = require(__dirname + '/connection');
var tm = require(__dirname + '/tokenManager');
var USER_ROLES = require(__dirname + '/userRoles');


var get = function(req, res) {
  var user = tm.getUser(req);

  // No token = no profile
  if (!user) {
    res.status(401).send('Please log in to see profile');
    return;
  }

  connection.query('CALL getUser(?);', [user.userID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    // Check user still exists.  User could have been deleted between getting token and calling function
    if (rows[0].length === 0) {
      res.status(401).send('There was a problem with your account.  Please contact VTE support.');
      return;
    }

    user.firstName = rows[0][0].firstName;
    user.lastName = rows[0][0].lastName;
    user.DOB = rows[0][0].DOB;
    user.sex = rows[0][0].sex;
    user.phone = rows[0][0].phone;

    // If user isn't a tutor or pending user, can finish now.
    if (user.role != USER_ROLES.pendingTutor && user.role != USER_ROLES.tutor) {
      res.json(user);
      return;
    }

    user.bio = rows[0][0].bio;
    user.visible = rows[0][0].visible;

    // Get list of units tutored
    conneciton.query('CALL getTutoredUnits(?);', [user.userID], function(err, rows) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      user.units = rows[0];

      // Get list of languages tutored
      conneciton.query('CALL getTutoredLanguages(?);', [user.userID], function(err, rows) {
        if (err) {
          console.log(String(err));
          res.status(500).send('There was a problem connecting to the database');
          return;
        }

        user.languages = rows[0];
        res.json(user);
        return;
      });
    });
  });
};


var update = function(req, res) {
  var user = tm.getUser(req);

  // No token = no profile
  if (!user) {
    res.status(401).send('Please log in to see profile');
    return;
  }

  var profile = req.body.user;

  // Update phone number only.  Don't want other fields to be changed by accident
  connection.query('UPDATE user SET phone = ? WHERE userID = ?;', [profile.phone, profile.userID], function(err) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    // If user isn't a tutor or pending user, can finish now.
    if (user.role != USER_ROLES.pendingTutor && user.role != USER_ROLES.tutor) {
      res.json({success: true, message: 'Update Successful'});
      return;
    }

    // If user is a tutor, update bio and visibility
    connection.query('CALL updateTutorProfile(?, ?, ?);', [profile.userID, profile.bio, profile.visible], function(err) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      // TODO: update units and languages
      // ********************************

      res.json({success: true, message: 'Update Successful'});
    });
  });
};


module.exports = {
  get:    get,
  update: update,
};
