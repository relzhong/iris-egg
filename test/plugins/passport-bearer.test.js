const mock = require('egg-mock');
const assert = require('power-assert');

describe('plugin: datasource', () => {
  let app;
  before(() => {
    mock(process.env, 'IRIS_EGG_GATEWAY', 'true');
    app = mock.app({
      baseDir: 'gateway',
      framework: true,
    });
    return app.ready();
  });

  after(() => app.close());

  afterEach(mock.restore);

  it('should GET 401 /', async () => {
    return await app.httpRequest()
      .get('/')
      .expect({ error: 1002, message: 'no user in ctx' })
      .expect(401);
  });

  it('should GET 200 /home', async () => {
    return await app.httpRequest()
      .get('/home')
      .expect({ error: 0, data: 'hello' })
      .expect(200);
  });

});

