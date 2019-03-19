const path = require('path');
const REPOSITORIES = Symbol('loadedRepositories');
const R = require('ramda');
module.exports = app => {
  // merge repository with current sequelize model;
  const repository = R.merge(app.model, {});
  // app.repository
  Object.defineProperty(app, 'repository', {
    value: repository,
    writable: true,
  });

  // repository load should be behind datasource;
  app.loader.loadToApp(path.join(app.config.baseDir, 'app/repository'), REPOSITORIES, {
    inject: app,
    caseStyle: 'upper',
    ignore: 'index.js',
  });
  for (const name of Object.keys(app[REPOSITORIES])) {
    const klass = app[REPOSITORIES][name];
    app.logger.info('[egg-repository]', 'initialized repository : ' + name);
    // only this Sequelize Model class
    if (klass.getType && klass.getType() === 'adapter') {
      app.repository[name] = klass;
    }
    // add personal property method to repository.
    if (klass.getType && klass.getType() === 'sequelizeModel') {
      Object.getOwnPropertyNames(klass).forEach(propertyName => {
        if (![ 'length', 'name', 'prototype' ].includes(propertyName)) {
          app.repository[name][propertyName] = klass[propertyName];
        }
      });
      Object.getOwnPropertyNames(klass.prototype).forEach(prototypeName => {
        if (![ 'constructor' ].includes(prototypeName)) {
          app.repository[name].prototype[prototypeName] = klass.prototype[prototypeName];
        }
      });
    }
  }
};
