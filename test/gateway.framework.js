const mock = require('egg-mock');

describe('framework: IRIS_EGG_GATEWAY', () => {
  let app;
  before(() => {
    mock(process.env, 'IRIS_EGG_GATEWAY', 'true');
    app = mock.app({
      baseDir: 'base',
      framework: true,
    });
    return app.ready();
  });

  after(() => app.close());

  afterEach(mock.restore);

});
