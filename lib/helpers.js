// helpers for various tasks

const crypto = require("crypto");
const config = require("../config");
// container for all the helpers
const helpers = {};

// crewte a SHA256 hash
helpers.hash = (str) => {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");

    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all caes without throwing
helpers.parseJsonToObject = (str) => {
  console.log(str);
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (error) {
    return {};
  }
};

module.exports = helpers;
