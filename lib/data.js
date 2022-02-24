/** @format */

// storing and editing data
const fs = require('fs');
const path = require('path');

// container

const lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// write data to the file
lib.create = (dir, file, data, cb) => {
  // open the file for writing
  fs.open(
    lib.baseDir + dir + '/' + file + '.json',
    'wx',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // convert data to string
        const stringData = JSON.stringify(data);

        // write data and close the file
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                cb(false);
              } else {
                cb('Error on closing new file');
              }
            });
          } else {
            cb('Error writing to new file');
          }
        });
      } else {
        cb('Could not create new file, it may already exist');
      }
    }
  );
};

lib.read = (dir, file, cb) => {
  fs.readFile(
    lib.baseDir + dir + '/' + file + '.json',
    'utf-8',
    (err, data) => {
      cb(err, data);
    }
  );
};

module.exports = lib;
