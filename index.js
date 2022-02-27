/** @format */

const server = require('./lib/server');
// const workers = require('./lib/workers');

const app = {};

app.init = () => {
  // start server
  server.init();

  // start workders
  // workers.init();
};

app.init();

module.exports = app;
