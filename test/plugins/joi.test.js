const mock = require('egg-mock');
const assert = require('power-assert');

describe('plugin: joi', () => {
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

  it('should found joi in app', () => {
    assert(app.Joi);
  });

  it('should return schame error when schame has problem', () => {
    mock(app.config, 'baseDir', '/tmp/mockapp');
    const ctx = app.mockContext();
    const VInfo = ctx.validate();
    assert(VInfo.error);
  });

  it('should not return error when not config joi', () => {
    mock(app.config, 'joi', undefined);
    const Joi = app.Joi;
    const ctx = app.mockContext();
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    const VInfo = ctx.validate(schema, { pageSize: 1, search: '123' });
    assert(!VInfo.error);
  });

  it('should get not error when validate schame success by passing data', () => {
    const Joi = app.Joi;
    const ctx = app.mockContext();
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    const VInfo = ctx.validate(schema, { pageSize: 1, search: '123' });
    assert(!VInfo.error);
  });

  it('should get error when validate schame fail by passing data', () => {
    const Joi = app.Joi;
    const ctx = app.mockContext();
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    const VInfo = ctx.validate(schema, { pageSize: 1, search: '' });
    assert(VInfo.error);
  });

  it('should get not error when validate schame success by request params and querystring', () => {
    const Joi = app.Joi;
    const ctx = app.mockContext();
    ctx.params = { search: '123' };
    ctx.request.querystring = 'pageSize=1';
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    const VInfo = ctx.validate(schema);
    assert(!VInfo.error);
  });

  it('should get error when validate schame fail by request params and querystring', () => {
    const Joi = app.Joi;
    const ctx = app.mockContext();
    ctx.params = { search: '123' };
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    const VInfo = ctx.validate(schema);
    assert(VInfo.error);
  });

  it('should get not error when validate schame success by request params and body', () => {
    const Joi = app.Joi;
    const ctx = app.mockContext();
    ctx.params = { search: '123' };
    ctx.request.method = 'POST';
    ctx.request.body = { pageSize: 1 };
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    const VInfo = ctx.validate(schema);
    assert(!VInfo.error);
  });

  it('should throw error when schame has problem', () => {
    const ctx = app.mockContext();
    assert.throws(() => ctx.assert());
  });

  it('should throw not error when validate schame success by passing data', () => {
    const Joi = app.Joi;
    const ctx = app.mockContext();
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    assert.doesNotThrow(() => ctx.assert(schema, { pageSize: 1, search: '123' }));
  });

  it('should throw error when validate schame fail by passing data', () => {
    const Joi = app.Joi;
    const ctx = app.mockContext();
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    assert.throws(() => ctx.assert(schema, { pageSize: 1, search: '' }));
  });

  it('should throw not error when validate schame success by request params and querystring', () => {
    const Joi = app.Joi;
    const ctx = app.mockContext();
    ctx.params = { search: '123' };
    ctx.request.querystring = 'pageSize=1';
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    assert.doesNotThrow(() => ctx.assert(schema));
  });

  it('should throw error when validate schame fail by request params and querystring', () => {
    const Joi = app.Joi;
    const ctx = app.mockContext();
    ctx.params = { search: '123' };
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    assert.throws(() => ctx.assert(schema));
  });

  it('should throw not error when validate schame success by request params and body', () => {
    const Joi = app.Joi;
    const ctx = app.mockContext();
    ctx.params = { search: '123' };
    ctx.request.method = 'POST';
    ctx.request.body = { pageSize: 1 };
    const schema = Joi.object().keys({
      pageSize: Joi.number().required(),
      search: Joi.string().required(),
    });
    assert.doesNotThrow(() => ctx.assert(schema));
  });

});
