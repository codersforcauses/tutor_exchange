var connection = require(__dirname + '/connection');
var tm = require(__dirname + '/tokenManager');
var USER_ROLES = require(__dirname + '/userRoles');


var emailVerify = function(req, res) {
  if (!req.query.id || !req.query.code) {
    res.status(401).send('Invalid Email Verification Request');
  }

  connection.query('CALL getUser(?);', [req.query.id], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    // Check user still exists.  User could have been deleted before email was received
    if (rows[0].length === 0) {
      res.status(401).send('There was a problem with your account.  Please contact VTE support.');
      return;
    }

    var user = rows[0][0];

    if (user.verifyCode != req.query.code) {
      res.status(401).send('Confirmation code may have expired.');
      return;
    }

    if (user.emailVerified) {
      res.status(200).send('User is Already Verified');
      return;
    }

    connection.query('CALL confirmEmailVerified(?);', [user.userID], function(err) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      connection.query('CALL getAccountStatus(?);', [user.userID], function(err) {
        if (err) {
          console.log(String(err));
          res.status(500).send('There was a problem connecting to the database');
          return;
        }

        var status = rows[0][0];

        if (status.isTutor && !status.isVetted) {
          //sendTutorInfoEmail(req.query.id, result[0].firstName);
        }

        res.redirect('/#!/login');//Maybe have a seperate 'verify success' page?
      });
    });
  });
};


var sendVerifyEmail = function(req, res) {
  var user = tm.getUser(req);

  // No token = no profile
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  if (user.role !== USER_ROLES.pendingUser) {
    res.status(403).send('Your Account is Already Verified');
    return;
  }

  connection.query('CALL getUser(?);', [user.userID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    //sendVerifyEmail(currentUser.id, rows[0].firstName, req.headers.host, function(result, err) {
    //  if (err) {
    //    res.json({success: false, message: 'An Error Occurred when Sending Verification Email'});
    //    return;
    //  }
    //  res.json(result);
    //});

    res.end();
  });
};


module.exports = {
  emailVerify: emailVerify,
  sendVerifyEmail: sendVerifyEmail,
};
