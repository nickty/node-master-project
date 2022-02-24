// Dependency
const { update } = require("./data");
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

// required data: phone
// option data: firstName, lastName, password ( at least one must be specified)
// @todo only let authenticated user, there own can only be accessed
hanlders._users.put = (data, cb) => {
  // check for the required filed
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;

  //   check for the optional fields

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

  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // Error if the phone is invalid
  if (phone) {
    if (firstName || lastName || password) {
      console.log(phone);
      // look up user
      _data.read("users", phone, (err, userData) => {
        if (!err && userData) {
          // updte the filed necessrary
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            update.lastName = lastName;
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }

          // store new update
          _data.update("users", phone, userData, (err) => {
            if (!err) {
              cb(200);
            } else {
              console.log(err);
              cb(500, { Error: "Could not update user" });
            }
          });
        } else {
          cb(400, { Error: "user not exist" });
        }
      });
    } else {
      cb(400, { Error: "Missing filed to update" });
    }
  } else {
    cb(400, { Error: "Missing required field" });
  }
};

// required filed: phone
// @todo only let authenticated user to delete their data
// @todo delete any other data file
hanlders._users.delete = (data, cb) => {
  // Check if the phone number is valid
  const phone =
    typeof data.queryString.phone == "string" &&
    data.queryString.phone.trim().length == 10
      ? data.queryString.phone
      : false;

  if (phone) {
    _data.read("users", phone, (err, data) => {
      if (!err && data) {
        _data.delete("users", phone, (err) => {
          if (!err) {
            cb(200);
          } else {
            cb(500);
          }
        });
      } else {
        cb(400, { Error: "Uer not found" });
      }
    });
  } else {
    cb(400, { Error: "Missing required field" });
  }
};

// tokens
hanlders.tokens = (data, cb) => {
  console.log(data);
  const acceptableMethods = ["post", "get", "put", "delete"];

  if (acceptableMethods.indexOf(data.method) > -1) {
    hanlders._tokens[data.method](data, cb);
  } else {
    cb(405);
  }
};

// container for all the token methods

hanlders._tokens = {};

// require data: phone, password
// optional data: none
hanlders._tokens.post = (data, cb) => {
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

  if (phone && password) {
    //   look the user who matches that phone number
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        // has the sent password and compare it stored password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword == userData.hashedPassword) {
          // if valid create a new token with a radom name, set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };

          //   store the token
          _data.create("tokens", tokenId, tokenObject, (err) => {
            if (!err) {
              cb(200, tokenObject);
            } else {
              cb(500, { Error: "Could not create the new token" });
            }
          });
        } else {
          cb(400, { Error: "Password did not match" });
        }
      } else {
        cb(400, { Error: "could not find the user" });
      }
    });
  } else {
    cb(400, { Error: "Missing required fields" });
  }
};

// required data: id
hanlders._tokens.get = (data, cb) => {
  // check that the id
  const id =
    typeof data.queryString.id == "string" &&
    data.queryString.id.trim().length == 20
      ? data.queryString.id
      : false;

  if (id) {
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        // remove the hased password from user object before return it to requester

        cb(200, tokenData);
      } else {
        cb(404);
      }
    });
  } else {
    cb(400, { Error: "Missing required field" });
  }
};
hanlders._tokens.update = (data, cb) => {};
hanlders._tokens.delete = (data, cb) => {};

// export the moudle
module.exports = hanlders;
