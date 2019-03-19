const path = require('path');
const changeCase = require('change-case');
const R = require('ramda');

const DATASOURCE = Symbol('loadedDatasources');
const ConsoleTransport = require('egg-logger').ConsoleTransport;
module.exports = app => {
  // app.datasource
  Object.defineProperty(app, 'datasource', {
    value: {},
    writable: true,
  });

  app.getLogger('datasourceLogger').set('console', new ConsoleTransport({
    level: 'ERROR',
  }));

  // load datasource;
  app.loader.loadToApp([ path.join(app.config.baseDir, 'app/datasource'), path.join(app.config.baseDir, 'app/mocks') ], DATASOURCE, {
    inject: app,
    caseStyle: 'upper',
  });
  // support mock
  const names = Object.keys(app[DATASOURCE]);
  const datasources = R.uniq(names.map(name => name.replace('Mock', '')));
  for (const name of datasources) {
    let realName = name;
    if (app.config.datasource[name] && app.config.datasource[name].mock) {
      realName = name + 'Mock';
    }
    const klass = app[DATASOURCE][realName];
    app.logger.info('[egg-datasource]', 'initialized datasource : ' + realName);
    // only this Sequelize Model class
    if (klass.getType && klass.getType() === 'datasource') {
      app.datasource[changeCase.camelCase(name)] = new klass();
    }
  }
};
