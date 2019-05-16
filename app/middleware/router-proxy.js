const urlPattern = require('url-pattern');
const axios = require('axios');
const url = require('url');
const createError = require('http-errors');
const fs = require('fs');
const needle = require('needle');

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
        const req = {
          method: ctx.method,
          url: url.format(Object.assign(new url.URL(ctx.href), {
            hostname: app.config.servicesInfo[routerInfo.service].hostname,
            port: app.config.servicesInfo[routerInfo.service].port })),
          data: ctx.request.body,
          headers,
        };
        let res;
        if (ctx.get('Content-Type') && ctx.get('Content-Type').indexOf('multipart/form-data') > -1) {
          if (!ctx.request.files || !ctx.request.files[0]) throw createError(400, 'upload fail!', { code: 1001 });
          req.data = Object.assign({
            file: {
              filename: ctx.request.files[0].filename,
              buffer: fs.readFileSync(ctx.request.files[0].filepath),
              content_type: 'application/octet-stream',
            },
          }, ctx.request.body);
          res = await needle('post', req.url, req.data, { multipart: true, headers: req.headers });
          if (res.statusCode !== 200) {
            const err = new Error();
            err.response = { status: res.statusCode, data: res.body };
            throw err;
          }
          ctx.body = res.body;
        } else {
          res = await axios(req);
          ctx.body = res.data;
        }
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
