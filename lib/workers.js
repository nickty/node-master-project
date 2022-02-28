/** @format */

// These are worker related task

const path = require('path');
const fs = require('fs');
const _data = require('./data');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');

const _logs = require('./logs');

let workers = {};

workers.gatherAllChecks = () => {
  // Get all the check that exist in the system
  _data.list('checks', (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        // Read the the check data
        _data.read('checks', check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // pas is to check validator and let that funciton contitnue for error
            workers.validateCheckData(originalCheckData);
          } else {
            console.log('Error reading on of the check data');
          }
        });
      });
    } else {
      console.log('Error. Could not find any check to procceed');
    }
  });
};

// Sanityt check the check data
workers.validateCheckData = (originalCheckData) => {
  console.log(originalCheckData);
  originalCheckData =
    typeof originalCheckData == 'object' && originalCheckData !== null
      ? originalCheckData
      : {};
  originalCheckData.id =
    typeof originalCheckData.id == 'string' &&
    originalCheckData.id.trim().length == 20
      ? originalCheckData.id.trim()
      : false;
  originalCheckData.userPhone =
    typeof originalCheckData.userPhone == 'string' &&
    originalCheckData.userPhone.trim().length == 10
      ? originalCheckData.userPhone.trim()
      : false;
  originalCheckData.protocol =
    typeof originalCheckData.protocol == 'string' &&
    ['http', 'https'].indexOf(originalCheckData.protocol) > -1
      ? originalCheckData.protocol
      : false;
  originalCheckData.url =
    typeof originalCheckData.url == 'string' &&
    originalCheckData.url.trim().length > 0
      ? originalCheckData.url.trim()
      : false;
  originalCheckData.method =
    typeof originalCheckData.method == 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1
      ? originalCheckData.method
      : false;
  originalCheckData.successCodes =
    typeof originalCheckData.successCodes == 'object' &&
    originalCheckData.successCodes instanceof Array &&
    originalCheckData.successCodes.length > 0
      ? originalCheckData.successCodes
      : false;
  originalCheckData.timeoutSeconds =
    typeof originalCheckData.timeoutSeconds == 'number' &&
    originalCheckData.timeoutSeconds % 1 === 0 &&
    originalCheckData.timeoutSeconds >= 1 &&
    originalCheckData.timeoutSeconds <= 5
      ? originalCheckData.timeoutSeconds
      : false;

  if (
    originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCode &&
    originalCheckData.timeoutSeconds
  ) {
    workers.performCheck(originalCheckData);
  } else {
    console.log('Error: one of the check is not properly formated');
  }
};

workers.performCheck = (originalCheckData) => {
  // prepare the initial check outcome
  const checkOutcome = {
    error: false,
    responsCode: false,
  };

  // mark the out come and not sent yet
  let outcomeSent = false;

  // parase thehost and the path out the origin check data
  const parsedUrl = url.parse(
    originalCheckData.protocol + '://' + originalCheckData.url,
    true
  );
  const hostname = parsedUrl.hostname;

  const path = parsedUrl.path;

  // constructing the request
  const requestDetails = {
    protocol: originalCheckData.protocol + ':',
    hostname: hostname,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  // Instantiate the request object (using http or https method)
  const _moduleToUse = originalCheckData.protocol == 'http' ? http : http;
  const req = _moduleToUse.request(requestDetails, (res) => {
    // Grab the status of the sent request
    const status = res.statusCode;

    // Updat the check outcome and pass the data along
    checkOutcome.responsCode = status;
    if (!outcomeSent) {
      workers.procesCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the error evnet s it doesnt' get hrown
  req.on('error', (e) => {
    // Update the checkout and pass the data along
    checkOutcome.error = {
      error: true,
      value: e,
    };

    if (!outcomeSent) {
      workers.procesCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the timeout
  req.on('timeout', (e) => {
    // Update the checkout and pass the data along
    checkOutcome.error = {
      error: true,
      value: 'timeout',
    };

    if (!outcomeSent) {
      workers.procesCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // end the request
  req.end();
};

// Process thecoutclo andutep data and provide alaert
// secpial logi or accomdating a check thathasnever been tested before
workers.procesCheckOutcome = (originalCheckData, checkOutcome) => {
  // Decide if the check is considered up or down

  const state =
    !checkOutcome.error &&
    checkOutcome.responsCode &&
    originalCheckData.successCode.indexOf(checkOutcome.responsCode) > -1
      ? 'up'
      : 'down';

  // Decide if an alert is warranted
  const alertWarented =
    originalCheckData.lastCheck && originalCheckData.state !== state
      ? true
      : false;

  // log the outcome
  const timeOfCheck = Date.now();
  workers.log(
    checkOutcome,
    state,
    alertWarented,
    originalCheckData,
    timeOfCheck
  );

  // update the check data
  const newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastCheck = timeOfCheck;

  // save the update
  _data.update('checks', newCheckData.id, newCheckData, (err) => {
    if (!err) {
      // send the new check data to the nex tpahse of th proceess if needed
      if (alertWarented) {
        workers.alertUserToStatusChange(newCheckData);
      } else {
        console.log('Check out come has not change, no alert');
      }
    } else {
      console.log('Error tying to save udpate to ond of the checks');
    }
  });
};

// Alert the user as to a change in their check status
workers.alertUserToStatusChange = (newCheckData) => {
  const msg =
    'Alert: Your check for' +
    newCheckData.method.toUpperCase() +
    ' ' +
    newCheckData.protocol +
    '://' +
    newCheckData.url +
    ' is currently' +
    newCheckData.state;
  helpers.sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log('User is alrted by sms', msg);
    } else {
      console.log(
        'Could not send sms alert who has state change in their checks'
      );
    }
  });
};

workers.log = (
  checkOutcome,
  state,
  alertWarented,
  originalCheckData,
  timeOfCheck
) => {
  // Form the log data
  const logData = {
    check: originalCheckData,
    outcome: checkOutcome,
    state: state,
    alert: alertWarented,
    time: timeOfCheck,
  };

  // Convert data to string
  const logString = JSON.stringify(logData);

  // Determind the name of the log file
  const logFileName = originalCheckData.id;

  // Append the log string to the file
  _logs.append(logFileName, logString, (err) => {
    if (!err) {
      console.log('Logging to file succecced');
    } else {
      console.log('Logging to file failed');
    }
  });
};

// Timer to execute the workder process
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 1000 * 60);
};

// Rotate compresses thelog file
workers.rotateLogs = () => {
  // List all the non compressed file
  _logs.list(false, (err, logs) => {
    if (!err && logs && logs.length > 0) {
      logs.forEach((logName) => {
        // Compressed the data in a different file
        const logId = logName.replace('.log', '');
        const newFileId = logId + '-' + Date.now();
        _logs.compress(logId, newFileId, (err) => {
          if (!err) {
            // Truncate the log
            _logs.truncate(logId, (err) => {
              if (!err) {
                console.log('Success truncating the log file');
              } else {
                console.log('Error truncating the log file');
              }
            });
          } else {
            console.log('Error compressing one of the log tie', err);
          }
        });
      });
    } else {
      console.log('Error: could not find any logs to rotate');
    }
  });
};
// Log rotation once per day
workers.logRotateLoop = () => {
  setInterval(() => {
    workers.rotateLogs();
  }, 1000 * 60 * 60 * 24);
};

workers.init = () => {
  // execute all the checks
  workers.gatherAllChecks();

  // call the loops
  workers.loop();

  // Compress all the logs immediately
  workers.rotateLogs();

  // Call the comperssionloop so log swill be comppressed later on
  workers.logRotateLoop();
};

module.exports = workers;
