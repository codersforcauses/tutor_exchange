var config      = require(__dirname + '/config');
var hashes      = require(__dirname + '/hashes');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var fs = require('fs');


var readHTMLFile = function(path, callback) {
  fs.readFile(path, {encoding: 'utf-8'}, function(err, html) {
    if (err) {
      callback(err);
    } else {
      callback(null, html);
    }
  });
};


function sendVerifyEmail(userID, firstName, hostURL, callback) { //hostURL eg. http://localhost:8080, www.volunteertutorexchange.com etc
  if (!config.devOptions.sendMail) return;

  var verifyCode = hashes.genRandomString(20);
  var userEmail = userID + '@student.uwa.edu.au';
  var verifyLink = hostURL+'/emailVerify?id='+userID+'&code='+verifyCode;

  connection.query('UPDATE user SET verifyCode = ? WHERE userID = ?',[verifyCode, userID], function(err, result, fields) {
    if (err) {
      console.log(err);
      return;
    }
    readHTMLFile(__dirname+'/../app/emailTemplates/verifyEmailInline.html', function(err, html) {
      //var sauce = $("#verify-email").html();
      var template = handlebars.compile(html)/*sauce*/;
      var replacements = {
        firstName: firstName,
        verifyLink: verifyLink,
      };
      var readyHTML = template(replacements);
      var data = {
        from: '"Volunteer Tutor Exchange" <noreply@volunteertutorexchange.com>',
        to:   userEmail,
        subject: 'Email Verification',
        text: 'Hi '+firstName+', welcome to Volunteer Tutor Exchange! Please click the link to verify your account. '+verifyLink,
        html: readyHTML,
      };
      sendMail(data, function(result, error) {
        if (result && result.accepted[0] === userEmail) {
          callback({success: true, message: 'Verification Email Successfully Sent'});
        } else {
          callback(result, error);
        }
      });
    });
  });
}

function sendTutorInfoEmail(userID, firstName, callback) {
  if (!config.devOptions.sendMail) return;

  var userEmail = userID + '@student.uwa.edu.au';

  readHTMLFile(__dirname+'/../app/emailTemplates/tutorInfoEmailInline.html', function(err, html) {
    var template = handlebars.compile(html);
    var replacements = {
      firstName: firstName,
    };
    var readyHTML = template(replacements);
    var data = {
      from: '"Volunteer Tutor Exchange" <noreply@volunteertutorexchange.com>',
      to:   userEmail,
      subject: 'Tutor Information',
      text: 'Hi '+firstName+', thanks for applying as a Volunteer Tutor! Please check the About page (https://volunteertutorexchange.com/about) for instructions on gettign verified.',
      html: readyHTML,
    };
    sendMail(data, function(result, error) {
      if (result && result.accepted[0] === userEmail) {
        callback({success: true, message: 'Tutor Information Email Successfully Sent'});
      } else {
        callback(result, error);
      }
    });
  });
}

function sendMail(mailOptions, callback) {
  if (!config.devOptions.sendMail) return;

  var transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: config.mailgunServer,
  });

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return callback(info, error);
    }
    return callback(info);
  });
}


module.exports = {
  readHTMLFile: readHTMLFile,
  sendVerifyEmail: sendVerifyEmail,
  sendTutorInfoEmail: sendTutorInfoEmail,
  sendMail: sendMail,
};
