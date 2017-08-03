var jwt = require('jsonwebtoken');
var config = require(__dirname + '/config');


var getUser = function(req) {
  var token = (req.body && req.body.token) || (req.query && req.query.token) || (req.headers && req.headers.authorization);
  //console.log(token);

  if (!token || token.substring(0, 6) !== 'Bearer') {
    return false;
  }

  token = token.split(' ')[1];

  try {
    var decoded = jwt.verify(token, config.secret);
    //console.log(decoded);
    return {userID: decoded.userID, role: decoded.role};
  } catch (err) {
    //console.log('bad token');
    return false;
  }
};


var sign = function(userID, role) {
  return jwt.sign({userID: userID, role: role}, config.secret);
};


module.exports = {
  getUser:  getUser,
  sign:     sign,
};
