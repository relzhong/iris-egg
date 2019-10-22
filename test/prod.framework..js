const mock = require('egg-mock');

describe('framework: no DOMAIN_WHITE_LIST', () => {
  let app;
  before(() => {
    mock(process.env, 'DOMAIN_WHITE_LIST', '');
    mock(process.env, 'EGG_SERVER_ENV', 'prod');
    app = mock.app({
      baseDir: 'base',
      framework: true,
    });
    return app.ready();
  });

  after(() => app.close());

  afterEach(mock.restore);

  it('should GET /', async () => {
    return await app.httpRequest()
      .get('/')
      .expect({ error: 0, data: 'hello' })
      .expect(200);
  });

  it('should expect 500 GET /error', async () => {
    await app.httpRequest().get('/error').expect(500);
    await app.httpRequest().get('/error/unique').expect(500);
    await app.httpRequest().get('/error/400').expect(400);
    await app.httpRequest().get('/error/401').expect(401);
    await app.httpRequest().get('/error/401Code').expect(401);
    await app.httpRequest().get('/error/404').expect(404);
    await app.httpRequest().get('/error/500').expect(500);
    await app.httpRequest().post('/error/500').expect(500);
  });
});
