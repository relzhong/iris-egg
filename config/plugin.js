'use strict';

const path = require('path');

exports.static = false;

exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};

exports.passport = {
  enable: true,
  package: 'egg-passport',
};

exports.datasource = {
  enable: true,
  path: path.join(__dirname, '../lib/plugin/egg-datasource'),
};

exports.repository = {
  enable: true,
  path: path.join(__dirname, '../lib/plugin/egg-repository'),
};

exports.joi = {
  enable: true,
  path: path.join(__dirname, '../lib/plugin/egg-joi'),
};

exports.cors = {
  enable: true,
  package: 'egg-cors',
};

exports.multiCache = {
  enable: true,
  package: 'egg-multi-cache',
};

if (process.env.IRIS_EGG_GATEWAY) { 
  exports.passportBearer = {
    enable: true,
    path: path.join(__dirname, '../lib/plugin/egg-passport-bearer'),
  };
}

if (process.env.IRIS_EGG_APP) { 
  exports.passportJWT = {
    enable: true,
    path: path.join(__dirname, '../lib/plugin/egg-passport-jwt'),
  };
}

if (process.env.IRIS_EGG_GRAPHQL) { 
  exports.graphql = {
    enable: true,
    package: 'egg-graphql',
  };

  exports.connector = {
    enable: true,
    path: path.join(__dirname, '../lib/plugin/egg-connector'),
  };
}
