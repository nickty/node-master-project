/** @format */

// server related task

// Dependency
const http = require("http");

const url = require("url");

const StringDecoder = require("string_decoder").StringDecoder;

const helpers = require("./helpers");

const config = require("../config");
const hanlders = require("./handlers");

const path = require("path");

const server = {};

// send twilio sms
// helpers.sendTwilioSms('+8801717914839', 'Bismilla', (err) => {
//   console.log('There was an error', err);
// });

const httpServer = http.createServer((req, res) => {
  //get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // get the path from url, untrimmed path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+\/+$/g, "");

  console.log(trimmedPath);

  //   get the query string as an object
  const queryString = parsedUrl.query;

  //   get the http method
  const method = req.method.toLowerCase();

  //   get the header as an object
  const headers = req.headers;

  //   get the payload if there is any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", () => {
    buffer += decoder.end();

    // choose the hanldelr this request should go to, if one is fot foudn use the notfoud handlers
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : hanlders.notFound;
    // construct data object to send to the handlers

    const data = {
      trimmedPath: trimmedPath,
      queryString: queryString,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // Route the requet to the handlelr speifind in the router
    chosenHandler(data, (statusCode, payload, contentType) => {
      // use the statud code called back by the handlers or defual to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      // use the paylaod called back by the handler or defaul tot and exty object

      // Determind the type of content
      contentType = typeof contentType == "string" ? contentType : "json";

      // cnvert the payload to a string

      // content specific responst

      // return the response
      let paylaodString = "";
      if (contentType == "json") {
        res.setHeader("Content-Type", "application/json");
        payload = typeof payload == "object" ? payload : {};
        paylaodString = JSON.stringify(payload);
      }
      if (contentType == "html") {
        res.setHeader("Content-Type", "text/html");
        paylaodString = typeof payload == "string" ? payload : "";
      }

      res.writeHead(statusCode);
      res.end(paylaodString);

      // log the request path
      console.log("returning", statusCode, paylaodString);
    });
  });
});

// Define a request router
const router = {
  "/": hanlders.index,
  "/account/create": hanlders.accoutCreate,
  "/account/edit": hanlders.accountEdit,
  "/account/deleted": hanlders.accountDelete,
  "/session/create": hanlders.sessionCreate,
  "/session/deleted": helpers.sessionDeleted,
  "/checks/all": hanlders.checksList,
  "/checks/create": hanlders.checksCreate,
  "/checks/edit": hanlders.checkEdit,
  "/ping": hanlders.ping,
  "/api/users": hanlders.users,
  "/api/tokens": hanlders.tokens,
  "/api/checks": hanlders.checks,
};

// start the server with a port
server.init = () => {
  // Start the http server
  httpServer.listen(config.port, () => {
    console.log(
      `${config.port} now the port and the env is : ${config.envName}`
    );
  });
};

// export
module.exports = server;
