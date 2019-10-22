const mock = require('egg-mock');
const assert = require('power-assert');

describe('plugin: datasource', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'base',
      framework: true,
    });
    return app.ready();
  });

  after(() => app.close());

  afterEach(mock.restore);

  it('should found datasourece in ctx', () => {
    const ctx = app.mockContext();
    assert(ctx.datasource.Test);
  });

  it('should found mock datasourece in ctx', () => {
    const ctx = app.mockContext();
    assert(ctx.datasource.Testb);
  });

});

