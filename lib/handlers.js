// Dependency
const _data = require("./data");
const helpers = require("./helpers");

// These are the request handlers

const hanlders = {};

// ping handlers
hanlders.ping = (data, cb) => {
  cb(200);
};

// not found handler
hanlders.notFound = (data, cb) => {
  cb(200);
};

hanlders.users = (data, cb) => {
  console.log(data);
  const acceptableMethods = ["post", "get", "put", "delete"];

  if (acceptableMethods.indexOf(data.method) > -1) {
    hanlders._users[data.method](data, cb);
  } else {
    cb(405);
  }
};

// container for the user submethods
hanlders._users = {};

// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
hanlders._users.post = (data, cb) => {
  // check that all required fields are filled out
  //   console.log(data);
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure the user doesn't already exist
    _data.read("users", phone, (err, data) => {
      if (err) {
        //   hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          const userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            toAgreement: true,
          };

          _data.create("users", phone, userObject, (err) => {
            if (!err) {
              cb(200);
            } else {
              console.log(err);
              cb(500, { Error: "Could not create new user" });
            }
          });
        } else {
          cb(500, { Error: "Could not has the password" });
        }
      } else {
        // user already exist
        cb(400, { Error: "A user with that phone number is already exist" });
      }
    });
  } else {
    cb(400, { Error: "Missing required fields" });
  }
};
// required data: phone
// optional data: none
// @Todo only let an authenticated user access their object
hanlders._users.get = (data, cb) => {
  // check the phone provided is valid
  //   console.log("here is get methon is called");
  //   console.log("here are the data", data.queryString.phone);
  const phone =
    typeof data.queryString.phone == "string" &&
    data.queryString.phone.trim().length == 10
      ? data.queryString.phone
      : false;

  if (phone) {
    _data.read("users", phone, (err, data) => {
      if (!err && data) {
        // remove the hased password from user object before return it to requester
        delete data.hashedPassword;
        cb(200, data);
      } else {
        cb(404);
      }
    });
  } else {
    cb(400, { Error: "Missing required field" });
  }
};
hanlders._users.put = (data, cb) => {};
hanlders._users.delete = (data, cb) => {};

// export the moudle
module.exports = hanlders;
