/** @format */

// Primary file to the api

// Dependency
const http = require('http');

// the server should response all the request with a string

const server = http.createServer((req, res) => {
  res.end('Bismillah');
});

// start the server with a port
server.listen(3000, () => {
  console.log('server is started');
});
