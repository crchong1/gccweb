const path = require('path');
const nconf = require('nconf');

nconf.argv().env('__').file({file: path.join(__dirname, '../config.json')}).defaults({
  CLIENT_HOST: 'localhost',
  SERVER_HOST: 'localhost',
  NODE_ENV: 'dev',
  MONGODB_URI: 'mongodb://localhost:27017/gccweb',
});