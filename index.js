/** @format */

// Primary file to the api

// Dependency
const http = require('http');

const url = require('url');

// the server should response all the request with a string

const server = http.createServer((req, res) => {
  //get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // get the path from url, untrimmed path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+"\/+$/g, '');

  //   get the http method
  const method = req.method.toLowerCase();

  // send the response
  res.end('Bismillah');

  // log the request path
  console.log('path is: ', trimmedPath + ' with', method + ' method');
});

// start the server with a port
server.listen(3000, () => {
  console.log('server is started');
});
