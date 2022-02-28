/** @format */

// helpers for various tasks

const crypto = require("crypto");
const config = require("../config");
const https = require("https");
const querystring = require("querystring");

const path = require("path");
const fs = require("fs");
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

// Send an SMS messsage via Twillio
helpers.sendTwilioSms = (phone, msg, cb) => {
  phone =
    typeof phone == "string" && phone.trim().length == 14
      ? phone.trim()
      : false;
  msg =
    typeof msg == "string" && msg.trim().length > 0 && msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (phone && msg) {
    // Configure the request payload
    const paylaod = {
      From: config.twilio.fromPhone,
      To: phone,
      Body: msg,
    };

    console.log(paylaod);

    const stringPayload = querystring.stringify(paylaod);

    console.log(stringPayload);

    // configure the request details
    const requestDetails = {
      protocol: "https:",
      hostname: "api.twilio.com",
      method: "POST",
      path:
        "/2010-04-01/Accounts/" + config.twilio.accountSid + "/Messages.json",
      auth: config.twilio.accountSid + ":" + config.twilio.authToken,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringPayload),
      },
    };

    // requiest object
    const req = https.request(requestDetails, (res) => {
      // Grap the status of the send request
      const status = res.statusCode;
      // callback successful if the request wend well
      if (status == 200 || status == 201) {
        cb(false);
      } else {
        cb("Status code returned was " + status);
      }
    });

    // bind to the error event
    req.on("error", (e) => {
      cb(e);
    });

    // Add the payload
    req.write(stringPayload);

    // end the request
    req.end();
  } else {
    cb("Given parameters wre missing or invalid");
  }
};

// get the string content of a tempalte
helpers.getTemplate = (tempalteName, cb) => {
  tempalteName =
    typeof tempalteName == "string" && tempalteName.length > 0
      ? tempalteName
      : false;
  if (tempalteName) {
    const tempalteDir = path.join(__dirname, "/../template/");
    fs.readFile(tempalteDir + tempalteName + ".html", "utf-8", (err, str) => {
      if (!err && str && str.length > 0) {
        cb(false, str);
      } else {
        cb("No template could be found");
      }
    });
  } else {
    cb("A valid tempalte was not speicified");
  }
};

module.exports = helpers;
