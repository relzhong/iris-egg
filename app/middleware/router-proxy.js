const urlPattern = require('url-pattern');
const axios = require('axios');
const url = require('url');
const createError = require('http-errors');

module.exports = (config, app) => {
  const pattern = new urlPattern('/api/:version/:service/*');
  return async function(ctx, next) {
    const routerInfo = pattern.match(ctx.path);
    if (routerInfo && routerInfo.service !== 'base') {
      try {
        if (Object.keys(app.config.servicesInfo).indexOf(routerInfo.service) === -1) throw createError(404, 'Service not exist!');
        const headers = {};
        if (ctx.user) {
          headers.Authorization = ctx.headers.authorization;
          headers.jwt = ctx.user.jwt;
        }
        const res = await axios({
          method: ctx.method,
          url: url.format(Object.assign(new url.URL(ctx.href), {
            hostname: app.config.servicesInfo[routerInfo.service].hostname,
            port: app.config.servicesInfo[routerInfo.service].port })),
          data: ctx.request.body,
          headers,
        });
        ctx.body = res.data;
        await next();
      } catch (e) {
        if (e.response) {
          throw createError(e.response.status, e.response.data.message, { code: e.response.data.error });
        } else if (!e.response && e.request) {
          throw createError(404, 'Service not exist!', { code: 1020 });
        } else {
          e.code = 1020;
          throw e;
        }
      }
    } else {
      await next();
    }
  };
};
