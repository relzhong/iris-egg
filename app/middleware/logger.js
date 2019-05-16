const path = require('path');

module.exports = () => {
  const skipExt = [ '.png', '.jpeg', '.jpg', '.ico', '.gif' ];
  return async function(ctx, next) {
    const ext = path.extname(ctx.url).toLocaleLowerCase();
    const isSkip = skipExt.indexOf(ext) !== -1 && ctx.status < 400;
    const ua = ctx.get('user-agent') || '';
    await next();
    const rs = ctx.starttime ? Date.now() - ctx.starttime : 0;
    ctx.set('X-Response-Time', rs);

    if (!isSkip) {
      if (ctx.request.method !== 'GET') {
        ctx.logger.info({
          query: ctx.query,
          queries: ctx.queries,
          params: ctx.params,
          reqBody: ctx.request.body,
          resBody: ctx.response.body instanceof Buffer ? ctx.response.body.toString() : ctx.response.body, // support proxy
        });
      } else {
        ctx.logger.info(ua);
      }
    }
  };
};

