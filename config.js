/** @format */

// crete and export configuration variables

// container fo tall the environments

const environments = {};

// staging environment

environments.staging = {
  port: 3000,
  envName: 'staging',
  hashingSecret: 'nimizan',
  maxChecks: 5,
  twilio: {
    accountSid: 'AC5add62b75248fe31d72f6a1505c0b28d',
    authToken: '4bb7e5c409ca425e194977d62fa4546d',
    fromPhone: '+19036003680',
  },
};

// producttion environment
environments.production = {
  port: 5000,
  envName: 'production',
  hashingSecret: 'nimizanslos',
  maxChecks: 5,
  twilio: {
    accountSid: 'AC5add62b75248fe31d72f6a1505c0b28d',
    authToken: '4bb7e5c409ca425e194977d62fa4546d',
    fromPhone: '19036003680',
  },
};

// Determine which environment was passed as a commlan line artument
const currentEnv =
  typeof process.env.NODE_ENV == 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : '';

// chekc that the current enviorment on of the enviorment above if not defau to staging

const environmentExport =
  typeof environments[currentEnv] == 'object'
    ? environments[currentEnv]
    : environments.staging;

// export
module.exports = environmentExport;
