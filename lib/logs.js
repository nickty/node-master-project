/** @format */

// Libray for storing and rotating logs

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// constainer
const lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.logs/');

// Append a string to a file, creat ehf ile if it doesn texist
lib.append = (file, str, cb) => {
  // open the file for appending
  fs.open(lib.baseDir + file + '.log', 'a', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      fs.appendFile(fileDescriptor, str + '\n', (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              cb(false);
            } else {
              cb('Error closing the file');
            }
          });
        } else {
          cb('Error appending the file');
        }
      });
    } else {
      cb('Could not open file for appending');
    }
  });
};

module.exports = lib;
