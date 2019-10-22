

module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);
  router.get('/error', controller.error.index);
  router.get('/error/unique', controller.error.uniqueError);
  router.get('/error/400', controller.error.http400Error);
  router.get('/error/401', controller.error.http401Error);
  router.get('/error/404', controller.error.http404Error);
  router.get('/error/500', controller.error.http500Error);
  router.get('/error/401Code', controller.error.http401ErrorCode);
  router.post('/error/500', controller.error.http500ErrorPost);
  router.get('/error/500ua', controller.error.http500ErrorGetUA);

};
