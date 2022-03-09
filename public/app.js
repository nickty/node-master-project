/** @format */

// frontend logic of theapplication

var app = {};

app.config = {
  sessionToken: false,
};

// Ajax client for the resful api
app.client = {};

// Interface for making api calls
app.client.request = (
  headers,
  path,
  method,
  queryStringObject,
  payload,
  cb
) => {
  // set defaults
  headers = typeof headers == 'object' && headers !== null ? headers : {};
};
