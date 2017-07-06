#!bin/bash
echo "Generating test config file.  Please edit username and password."
cat > config.js << EOF
module.exports = {
  mysqlSettings: {
    host: '127.0.0.1',
    port: '3306',
    user: 'user',
    password: 'password',
    database: 'tutorexchange',
  },
};
EOF
