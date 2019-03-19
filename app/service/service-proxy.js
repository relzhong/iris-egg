const urlPattern = require('url-pattern');
const axios = require('axios');
const url = require('url');
const qs = require('qs');
const createError = require('http-errors');

module.exports = app => {
  const pattern = new urlPattern('/api/:version/:service/*');
  class ServiceProxy extends app.Service {
    /**
     * 跨服务请求
     * @param {string} path 请求路径
     * @param {string} data 请求参数, get请求为params
     * @param {Object} option axios option eg: {method: 'GET'}
     * @return {Object} 请求结果
     */
    async request(path, data, option) {
      const routerInfo = pattern.match(path);
      if (routerInfo && routerInfo.service !== 'base') {
        try {
          if (Object.keys(app.config.servicesInfo).indexOf(routerInfo.service) === -1) throw createError(404, 'Service not exist!');
          const headers = {};
          if (this.ctx.user) {
            headers.Authorization = this.ctx.headers.authorization;
            headers.jwt = this.ctx.headers.jwt;
          }
          const requestUrl = url.format({
            protocol: 'http',
            pathname: path.split('?')[0],
            search: path.split('?')[1],
            hostname: app.config.servicesInfo[routerInfo.service].hostname,
            port: app.config.servicesInfo[routerInfo.service].port });
          const requestData = {
            method: option.method,
            url: requestUrl,
            headers,
            paramsSerializer(params) {
              return qs.stringify(params, { arrayFormat: 'repeat' });
            },
          };
          if (option.method === 'GET') {
            requestData.params = data;
          } else {
            requestData.data = data;
          }
          const res = await axios(requestData);
          return res.data.data;
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
        throw createError(404, 'Service not exist!', { code: 1020 });
      }
    }
  }
  return ServiceProxy;
};
