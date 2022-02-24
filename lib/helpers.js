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

// Crea a string of radom alphametric chracters gov gien lenth
helpers.createRandomString = (stringLenth) => {
  stringLenth =
    typeof stringLenth == "number" && stringLenth > 0 ? stringLenth : false;
  if (stringLenth) {
    // Defind all the possible characters
    const possibleChar = "abcdefghijklmnopqrstuvwxyz0123456789";
    //  start final string
    let str = "";
    for (i = 1; i <= stringLenth; i++) {
      const radnomChars = possibleChar.charAt(
        Math.floor(Math.random() * possibleChar.length)
      );

      str += radnomChars;
    }

    return str;
  } else {
    return false;
  }
};

module.exports = helpers;
