/** @format */

// Primary file to the api

// Dependency
const http = require('http');

const url = require('url');

const StringDecoder = require('string_decoder').StringDecoder;

const _data = require('./lib/data');

// _data.create('test', 'nseswsFile', { foo: 'bar' }, (err) => {
//   console.log('this is an error', err);
// });
// _data.read('test', 'nseswsFile', (err, data) => {
//   console.log('this is an error', err, 'data is', data);
// });
_data.update('test', 'neswsFile', { this: 'bus' }, (err) => {
  console.log('this is an error', err);
});

// the server should response all the request with a string

const config = require('./config');

const server = http.createServer((req, res) => {
  //get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // get the path from url, untrimmed path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+\/+$/g, '');

  console.log(trimmedPath);

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

    // choose the hanldelr this request should go to, if one is fot foudn use the notfoud handlers
    const chosenHandler =
      typeof router[trimmedPath] !== 'undefined'
        ? router[trimmedPath]
        : hanlders.notFound;
    // construct data object to send to the handlers
    const data = {
      trimmedPath: trimmedPath,
      queryString: queryString,
      method: method,
      headers: headers,
      payload: buffer,
    };

    // Route the requet to the handlelr speifind in the router
    chosenHandler(data, (statusCode, payload) => {
      // use the statud code called back by the handlers or defual to 200
      statusCode = typeof statusCode == 'number' ? statusCode : 200;
      // use the paylaod called back by the handler or defaul tot and exty object
      payload = typeof payload == 'object' ? payload : {};

      // cnvert the payload to a string
      const paylaodString = JSON.stringify(payload);

      // return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(paylaodString);

      // log the request path
      console.log('returning', statusCode, paylaodString);
    });
  });
});

// start the server with a port
server.listen(config.port, () => {
  console.log(`${config.port} now the port and the env is : ${config.envName}`);
});

//defind handlers
const hanlders = {};

// ping handlers
hanlders.ping = (data, cb) => {
  cb(200);
};

// not found handler
hanlders.notFound = (data, cb) => {
  cb(200);
};

// Define a request router
const router = {
  '/ping': hanlders.sample,
};
