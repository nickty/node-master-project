/** @format */

// storing and editing data
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

// container

const lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

// write data to the file
lib.create = (dir, file, data, cb) => {
  // open the file for writing
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
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
                cb("Error on closing new file");
              }
            });
          } else {
            cb("Error writing to new file");
          }
        });
      } else {
        cb("Could not create new file, it may already exist");
      }
    }
  );
};

lib.read = (dir, file, cb) => {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf-8",
    (err, data) => {
      console.log(data);
      if (!err && data) {
        const parsedData = helpers.parseJsonToObject(data);
        cb(false, parsedData);
      } else {
        cb(err, data);
      }
    }
  );
};

lib.update = (dir, file, data, cb) => {
  // open the file for writng
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        const stringData = JSON.stringify(data);

        fs.truncate(fileDescriptor, (err) => {
          if (!err) {
            // write to the file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    cb(false);
                  } else {
                    cb("Error closing the file");
                  }
                });
              } else {
                cb("Error writing to existing file");
              }
            });
          } else {
            cb("Error truncating file");
          }
        });
      } else {
        cb("Could not open the file for update, it may not exist");
      }
    }
  );
};

// deleting file
lib.delete = (dir, file, cb) => {
  // unlink the file
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", (err) => {
    if (!err) {
      cb(false);
    } else {
      cb("Error deleting the file");
    }
  });
};

module.exports = lib;
