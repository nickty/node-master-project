/** @format */

// Primary file to the api

// Dependency
const http = require('http');

const url = require('url');

const StringDecoder = require('string_decoder').StringDecoder;

// the server should response all the request with a string

const server = http.createServer((req, res) => {
  //get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // get the path from url, untrimmed path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+"\/+$/g, '');

  //   get the query string as an object
  const queryString = parsedUrl.query;

  //   get the http method
  const method = req.method.toLowerCase();

  //   get the header as an object
  const headers = req.headers;

  //   get the payload if there is any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();

    //   do the rest
    // send the response
    res.end('Bismillah');

    // log the request path
    console.log('path is: ', trimmedPath + ' with', method + ' method');
    console.log('query string', queryString);
    console.log('headers are ', headers);
    console.log('payload is ', buffer);
  });
});

// start the server with a port
server.listen(3000, () => {
  console.log('server is started');
});
