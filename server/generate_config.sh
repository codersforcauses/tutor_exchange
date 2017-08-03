#!bin/bash
echo "Generating test config file.  Please edit username and password."

VAR1=`openssl rand -base64 32`

cat << EOF > config.js
module.exports = {
  secret: '$VAR1',

  mysqlSettings: {
    host: '127.0.0.1',
    port: '3306',
    user: 'user',
    password: 'password',
    database: 'tutorExchange',
  },

  server: {
    port: '8080',
  },

  devOptions: {
    serveStatic: true,
    sendMail: false,
  },

  mailgunServer: {
    user: 'postmaster@mail.volunteertutorexchange.com',
    password: '',
  },
};
EOF

VAR1=''
