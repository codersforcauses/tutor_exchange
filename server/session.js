var connection = require(__dirname + '/connection');
var hashes = require(__dirname + '/hashes');
var tm = require(__dirname + '/tokenManager');
var USER_ROLES = require(__dirname + '/userRoles');


var getRequests = function(req, res) {
  var user = tm.getUser(req);

  // No token = not logged in
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  connection.query('CALL getRequests(?);', [user.userID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    var requests = [];

    rows[0].forEach(function(row) {
      requests.push({
        sessionID: row.sessionID,
        otherUser: {
          userID: 0,  //TODO
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
        },
        time: Date.parse(row.time),
        unit: row.unit,
        comments: row.comment,
        isTutor: (row.role == 'TUTOR'),
      });
    });

    res.json(requests);
  });
};


var getAppointments = function(req, res) {
  var user = tm.getUser(req);

  // No token = not logged in
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  connection.query('CALL getAppointments(?);', [user.userID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    var appointments = [];

    rows[0].forEach(function(row) {
      appointments.push({
        sessionID: row.sessionID,
        otherUser: {
          userID: 0,  //TODO
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
        },
        time: Date.parse(row.time),
        unit: row.unit,
        comments: row.comment,
        isTutor: (row.role == 'TUTOR'),
        cancelled: (row.isCancelled == 1),
      });
    });

    res.json(appointments);
  });
};


var getOpenSessions = function() {
  var user = tm.getUser(req);

  // No token = not logged in
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  connection.query('CALL getOpenSessions(?);', [user.userID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    var openSessions = [];

    rows[0].forEach(function(row) {
      openSessions.push({
        sessionID: row.sessionID,
        otherUser: {
          userID: 0,  //TODO
          firstName: row.firstName,
          lastName: row.lastName,
        },
        time: Date.parse(row.time),
        unit: row.unit,
        isTutor: (row.role == 'TUTOR'),
      });
    });

    res.json(openSessions);
  });
};


var createRequest = function(req, res) {
  var user = tm.getUser(req);

  // No token = not logged in
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  if (user.role !== USER_ROLES.tutor) {
    res.status(403).send('Only tutors can create session requests');
    return;
  }

  var tzoffset = (new Date()).getTimezoneOffset() * 60000;

  var requestData = {
    tutor: currentUser.id,
    tutee: req.body.session.otherUser.userID,
    unit: req.body.session.unit,
    time: (new Date(req.body.session.time - tzoffset)).toISOString().substring(0, 19).replace('T', ' '),
    comments: req.body.session.comments,
  };


  if (parseInt(requestData.tutor) === parseInt(requestData.tutee)) {
    res.json({success: false, message: 'You cannot have a tutoring session with yourself.'});
    return;
  }

  if (Date.parse(requestData.time) < Date.now()) {
    res.json({success: false, message: 'You cannot arrange tutoring sessions in the past.'});
    return;
  }

  connection.query('CALL userExists(?);', [requestData.tutee], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (!rows[0].userExists) {
      res.json({success: false, message: 'Your student isn\'t fully registered with the system yet.  Make sure he/she is signed up andhas responded to the confirmation email.'});
      return;
    }

    connection.query('CALL getAppointments(?);', [user.userID], function(err, rows) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      var result = row[0];

      for (var i=0; i<result.length; i++) {
        if (Math.abs(Date.parse(result[i].time) - Date.parse(requestData.time)) < 1*60*60*1000) {
          //var message = (result[i].userID == user.id ? 'You have ': 'Your ' + result[i].role + ' has ') + 'a timetable clash.';
          var message = 'There is a timetable clash'; // TODO: fix when we have other user userID
          res.json({success: false, message: message});
          return;
        }
      }

      connection.query('CALL createRequest(?, ?, ?, ?, ?);', [requestData.tutee, requestData.tutor, requestData.unit, requestData.time, requestData.comments], function(err, rows) {
        if (err) {
          console.log(String(err));
          res.status(500).send('There was a problem connecting to the database');
          return;
        }

        res.json({success: true});
      });
    });
  });
};


var acceptRequest = function(req, res) {
  var user = tm.getUser(req);

  // No token = not logged in
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  if (!req.body || !req.body.sessionID) {
    res.status(400).send('Session ID not supplied');
    return;
  }

  connection.query('CALL getSession(?);', [req.body.sessionID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (rows[0].length === 0) {
      res.status(400).send('Session does not exist');
      return;
    }

    var session = rows[0][0];

    session.sessionID = req.body.sessionID; // TODO: fix this

    connection.query('CALL getAppointments(?);', [user.userID], function(err, rows) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      var result = row[0];

      for (var i=0; i<result.length; i++) {
        if (Math.abs(Date.parse(result[i].time) - Date.parse(requestData.time)) < 1*60*60*1000) {
          //var message = (result[i].userID == user.id ? 'You have ': 'Your ' + result[i].role + ' has ') + 'a timetable clash.';
          var message = 'There is a timetable clash'; // TODO: fix when we have other user userID
          res.json({success: false, message: message});
          return;
        }
      }

      connection.query('CALL acceptRequest(?);', [session.sessionID], function(err, rows) {
        if (err) {
          console.log(String(err));
          res.status(500).send('There was a problem connecting to the database');
          return;
        }

        res.json({success: true});
      });
    });
  });
};


var rejectRequest = function(req, res) {
  var user = tm.getUser(req);

  // No token = not logged in
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  if (!req.body || !req.body.sessionID) {
    res.status(400).send('Session ID not supplied');
    return;
  }

  connection.query('CALL getSession(?);', [req.body.sessionID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (user.userID !== rows[0][0].student) {
      res.status(400).send('Request not addressed to current user.');
      return;
    }

    connection.query('CALL rejectRequest(?);', [req.body.sessionID], function(err) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      res.end();
    });
  });
};


var cancelAppointment = function(req, res) {
  var user = tm.getUser(req);

  // No token = not logged in
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  if (!req.body || !req.body.sessionID) {
    res.status(400).send('Session ID not supplied');
    return;
  }

  connection.query('CALL getSession(?);', [req.body.sessionID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (user.userID !== rows[0][0].tutor) {
      res.status(400).send('Appointment was not originally created by current user.');
      return;
    }

    connection.query('CALL cancelAppointment(?);', [req.body.sessionID], function(err) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      res.end();
    });
  });
};


var closeSession = function(req, res) {
  var user = tm.getUser(req);

  // No token = not logged in
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  connection.query('CALL getSession(?);', [req.body.sessionID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (user.userID !== rows[0][0].student || user.userID !== rows[0][0].tutor) {
      res.status(400).send('Session does not belong to current user.');
      return;
    }

    connection.query('CALL closeSession(?, ?);', [req.body.sessionID, user.userID], function(err) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      res.end();
    });
  });
};


var appealSession = function(req, res) {
  var user = tm.getUser(req);

  // No token = not logged in
  if (!user) {
    res.status(401).send('Please log in.');
    return;
  }

  connection.query('CALL getSession(?);', [req.body.sessionID], function(err, rows) {
    if (err) {
      console.log(String(err));
      res.status(500).send('There was a problem connecting to the database');
      return;
    }

    if (user.userID !== rows[0][0].student || user.userID !== rows[0][0].tutor) {
      res.status(400).send('Session does not belong to current user.');
      return;
    }

    var reason = req.body.reason || '';

    connection.query('CALL appealSession(?, ?);', [req.body.sessionID, user.userID, reason], function(err) {
      if (err) {
        console.log(String(err));
        res.status(500).send('There was a problem connecting to the database');
        return;
      }

      res.end();
    });
  });
};


module.exports = {
  getRequests: getRequests,
  getAppointments: getAppointments,
  getOpenSessions: getOpenSessions,
  createRequest: createRequest,
  acceptRequest: acceptRequest,
  rejectRequest: rejectRequest,
  cancelAppointment: cancelAppointment,
  closeSession: closeSession,
  appealSession: appealSession,
};
