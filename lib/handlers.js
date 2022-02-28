/** @format */

// Dependency

const { update } = require("./data");
const _data = require("./data");
const helpers = require("./helpers");
const config = require("../config");

// These are the request handlers

const hanlders = {};

// html hanlders
// index is first
hanlders.index = (data, cb) => {
  // Reject any request without the get request
  if (data.method == "get") {
    // Read in a tempalte as a string
    helpers.getTemplate("index", (err, string) => {
      if (!err && string) {
        cb(200, string, "html");
      } else {
        cb(500, undefined, "html");
      }
    });
  } else {
    cb(405, undefined, "html");
  }
};

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
    data.payload.phone.trim().length == 14
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
            tosAgreement: true,
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
    // get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // verify that the given token is valide for the phone number
    hanlders._tokens.verifiedToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
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
        cb(403, { Error: "Missing required token in header or invalied" });
      }
    });
  } else {
    cb(400, { Error: "Missing required field" });
  }
};

// required data: phone
// option data: firstName, lastName, password ( at least one must be specified)

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
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      hanlders._tokens.verifiedToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
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
          cb(403, { Error: "Missing required token in header or invalied" });
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
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    hanlders._tokens.verifiedToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // look up user
        _data.read("users", phone, (err, userData) => {
          if (!err && data) {
            _data.delete("users", phone, (err) => {
              if (!err) {
                // delete each of the check accociate with user
                const userChecks =
                  typeof userData.checks == "object" &&
                  userData.checks instanceof Array
                    ? userData.checks
                    : [];

                const checksToDelete = userChecks.length;

                if (checksToDelete > 0) {
                  let checksDeleted = 0;
                  const deletionError = false;
                  // check
                  userChecks.forEach((checkId) => {
                    // delete check
                    _data.delete("checks", checkId, (err) => {
                      if (err) {
                        deletionError = true;
                      }
                      checksDeleted++;
                      if (checksDeleted == checksToDelete) {
                        if (!deletionError) {
                          cb(200);
                        } else {
                          cb(500, { Error: "Delete error of check from user" });
                        }
                      }
                    });
                  });
                } else {
                  cb(200);
                }
              } else {
                cb(500);
              }
            });
          } else {
            cb(400, { Error: "Uer not found" });
          }
        });
      } else {
        cb(403, { Error: "Missing required token in header or invalied" });
      }
    });
  } else {
    cb(400, { Error: "Missing required field" });
  }
};

// tokens
hanlders.tokens = (data, cb) => {
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

// required fields: id, extend
hanlders._tokens.put = (data, cb) => {
  const id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id
      : false;
  const extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;

  if (id && extend) {
    // look up the token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        // make sure the token not expired
        if (tokenData.expires > Date.now()) {
          // set expire 1 hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          _data.update("tokens", id, tokenData, (err) => {
            if (!err) {
              cb(200);
            } else {
              cb(500, { Error: "Could not update the token" });
            }
          });
        } else {
          cb(400, { Error: "Token expired" });
        }
      } else {
        cb(400, { Error: "Token don't exist" });
      }
    });
  } else {
    cb(400, { Error: "Missing required filed or invalid" });
  }
};
hanlders._tokens.delete = (data, cb) => {
  // Check if the phone number is valid
  const id =
    typeof data.queryString.id == "string" &&
    data.queryString.id.trim().length == 20
      ? data.queryString.id.trim()
      : false;

  if (id) {
    _data.read("tokens", id, (err, data) => {
      if (!err && data) {
        _data.delete("tokens", id, (err) => {
          if (!err) {
            cb(200);
          } else {
            cb(500);
          }
        });
      } else {
        cb(400, { Error: "token not found" });
      }
    });
  } else {
    cb(400, { Error: "Missing required field" });
  }
};

// Verify if a given token id is currently valid for a given user
hanlders._tokens.verifiedToken = (id, phone, cb) => {
  // look up the token
  _data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        cb(true);
      } else {
        cb(false);
      }
    } else {
      cb(false);
    }
  });
};

// Checks
hanlders.checks = (data, cb) => {
  const acceptableMethods = ["post", "get", "put", "delete"];

  if (acceptableMethods.indexOf(data.method) > -1) {
    hanlders._checks[data.method](data, cb);
  } else {
    cb(405);
  }
};

// Container for the checks
hanlders._checks = {};

// check post
// required dat: protocall, url, method, success codes, timeout secconds

hanlders._checks.post = (data, cb) => {
  const protocol =
    typeof data.payload.protocol == "string" &&
    ["https", "http"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;

  const url =
    typeof data.payload.url == "string" && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;

  const method =
    typeof data.payload.protocol == "string" &&
    ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;

  const successCode =
    typeof data.payload.successCode == "object" &&
    data.payload.successCode instanceof Array &&
    data.payload.successCode.length > 0
      ? data.payload.successCode
      : false;

  const timeoutSeconds =
    typeof data.payload.timeoutSeconds == "number" &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  if (protocol && url && method && successCode && timeoutSeconds) {
    // get the token from headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // console.log(token);

    // lookup the user by reading the token
    _data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = tokenData.phone;
        // console.log(userPhone);
        // look up the user
        _data.read("users", userPhone, (err, userData) => {
          if (!err && userData) {
            // console.log('Getting check user: ', userData);
            const userChecks =
              typeof userData.checks == "object" &&
              userData.checks instanceof Array
                ? userData.checks
                : [];

            // console.log(userChecks);

            // Very that the user has less than the number max checks
            if (userChecks.length < config.maxChecks) {
              // Create a random for the check
              let checkId = helpers.createRandomString(20);
              console.log(checkId);

              // create the check object and include the user phone
              const checkObject = {
                id: checkId,
                userPhone: userPhone,
                protocol: protocol,
                url: url,
                method: method,
                successCode: successCode,
                timeoutSeconds: timeoutSeconds,
              };

              _data.create("checks", checkId, checkObject, (err) => {
                if (!err) {
                  // ADD THECHECK TO USER OBJECT
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  // save the new user data
                  _data.update("users", userPhone, userData, (err) => {
                    if (!err) {
                      // Return the data about the new check
                      cb(200, checkObject);
                    } else {
                      cb(500, {
                        Error: "Could no update the user with new check",
                      });
                    }
                  });
                } else {
                  cb(500, { Error: "Could not create the new check" });
                }
              });
            } else {
              cb(400, { Error: "User already has the max number of check" });
            }
          } else {
            cb(403);
          }
        });
      } else {
        cb(403);
      }
    });
  } else {
    cb(400, { Error: "Missing requird input" });
  }
};

// Check -get
// Required :id
hanlders._checks.get = (data, cb) => {
  const id =
    typeof data.queryString.id == "string" &&
    data.queryString.id.trim().length == 20
      ? data.queryString.id
      : false;

  if (id) {
    // look up thecheck
    _data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        // get the token from the headers
        const token =
          typeof data.headers.token == "string" ? data.headers.token : false;

        hanlders._tokens.verifiedToken(
          token,
          checkData.userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              cb(200, checkData);
            } else {
              cb(403);
            }
          }
        );
      } else {
        cb(404);
      }
    });
  } else {
    cb(400, { Error: "Missing required field" });
  }
};

// check - put
// required : id
// option : protocal, url method, succscode, timeout seconod one must be send
hanlders._checks.put = (data, cb) => {
  // check for the required filed
  const id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;

  //   check for the optional fields

  const protocol =
    typeof data.payload.protocol == "string" &&
    ["https", "http"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;

  const url =
    typeof data.payload.url == "string" && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;

  const method =
    typeof data.payload.protocol == "string" &&
    ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;

  const successCode =
    typeof data.payload.successCode == "object" &&
    data.payload.successCode instanceof Array &&
    data.payload.successCode.length > 0
      ? data.payload.successCode
      : false;

  const timeoutSeconds =
    typeof data.payload.timeoutSeconds == "number" &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  console.log(id);

  // Error if the phone is invalid
  if (id) {
    if (protocol || url || method || successCode || timeoutSeconds) {
      // look up check
      _data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          // get the token
          const token =
            typeof data.headers.token == "string" ? data.headers.token : false;

          hanlders._tokens.verifiedToken(
            token,
            checkData.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                // update the data where neccessary
                if (protocol) {
                  checkData.protocol = protocol;
                }
                if (url) {
                  checkData.url = url;
                }
                if (method) {
                  checkData.method = method;
                }
                if (successCode) {
                  checkData.successCode = successCode;
                }
                if (timeoutSeconds) {
                  checkData.timeoutSeconds = timeoutSeconds;
                }

                // store new updates
                _data.update("checks", id, checkData, (err) => {
                  if (!err) {
                    cb(200);
                  } else {
                    cb(500, { Error: "Could not updte the check" });
                  }
                });
              } else {
                cb(403);
              }
            }
          );
        } else {
          cb(400, { Error: "Check ID did not exist" });
        }
      });
    } else {
      cb(400, { Error: "Missing filed to update" });
    }
  } else {
    cb(400, { Error: "Missing required field" });
  }
};

// check - delete
// required : id
hanlders._checks.delete = (data, cb) => {
  // Check if the phone number is valid
  const id =
    typeof data.queryString.id == "string" &&
    data.queryString.id.trim().length == 20
      ? data.queryString.id.trim()
      : false;

  if (id) {
    // Lookup the checks
    _data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        console.log(checkData);
        const token =
          typeof data.headers.token == "string" ? data.headers.token : false;

        hanlders._tokens.verifiedToken(
          token,
          checkData.userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // delete the check data
              console.log(tokenIsValid);
              _data.delete("checks", id, (err) => {
                if (!err) {
                  // look up user
                  _data.read("users", checkData.userPhone, (err, userData) => {
                    if (!err && userData) {
                      const userChecks =
                        typeof userData.checks == "object" &&
                        userData.checks instanceof Array
                          ? userData.checks
                          : [];
                      // Remove he delete check from their list of check
                      const checkPosition = userChecks.indexOf(id);

                      if (checkPosition > -1) {
                        userChecks.splice(checkPosition, 1);

                        userData.checks = userChecks;

                        // resave the user data
                        _data.update(
                          "users",
                          checkData.userPhone,
                          userData,
                          (err) => {
                            if (!err) {
                              cb(200);
                            } else {
                              cb(500, {
                                Error: "Could not update the specified user",
                              });
                            }
                          }
                        );
                      } else {
                        cb(500, {
                          Error: "Could not find the check in the user object",
                        });
                      }
                    } else {
                      cb(400, {
                        Error: "Could not find the user who created the check",
                      });
                    }
                  });
                } else {
                  cb(500, { Error: "Could not delete the check data" });
                }
              });
            } else {
              cb(403, {
                Error: "Missing required token in header or invalied",
              });
            }
          }
        );
      } else {
        cb(400, { Error: "Id doesnt exist" });
      }
    });
  } else {
    cb(400, { Error: "Missing required field" });
  }
};

// export the moudle
module.exports = hanlders;
