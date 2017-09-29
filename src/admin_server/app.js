import nconf from 'nconf';
require('../config.js');
nconf.set('APP_ENV', 'server');

import express from 'express';
import path from 'path';
import http from 'http';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import passport from 'passport';
import publicAPI from '../server/api';
import PageRouter from '../server/pageRouter';

process.on('unhandledRejection', err => {
  console.log("Caught unhandledRejection");
  console.log(err);
});

const app = express();
app.use(compression());

if (nconf.get('NODE_ENV') !== 'production') {
  const proxy = require('http-proxy-middleware');
  app.use(proxy(`http://${nconf.get('CLIENT_HOST')}:${nconf.get('CLIENT_PORT')}/public/js/*`));

  app.use(require('morgan')('dev'));
} else {
  app.use(require('morgan')('tiny'));
}

app.use('/public', express.static(path.join(__dirname, '../public')))

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [nconf.get('COOKIE_SECRET')],
  maxAge: 60 * 60 * 1000 // 1 hour
}));
app.use(passport.initialize());
app.use(passport.session());
require('./auth')(app);

app.use('/api', publicAPI);

const routes = require('../admin_client/routes').default;
const reducers = require('../admin_client/modules').default;
app.use(PageRouter(routes, reducers, (head, content, state) => {
  return `
    <!doctype html>
    <html ${head.htmlAttributes.toString()}>
      <head>
        ${head.title.toString()}
        ${head.meta.toString()}
        ${head.link.toString()}
      </head>
      <body ${head.bodyAttributes.toString()}>
        ${content}
        <script type="text/javascript">window.__INITIAL_STATE__ = ${JSON.stringify(state)}</script>
        <script type="text/javascript" src="/public/js/manifest.js"></script>
        <script type="text/javascript" src="/public/js/react.js"></script>
        <script type="text/javascript" src="/public/js/adminCommon.js"></script>
        <script type="text/javascript" src="/public/js/adminApp.js"></script>
      </body>
    </html>
  `;
}));

app.listen(nconf.get('SERVER_PORT'), function() {
  console.log('Server listening on port', nconf.get('SERVER_PORT'));
});