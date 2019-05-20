const axios = require('axios');

module.exports = app => {
  const gatewayAddress = `http://${app.config.servicesInfo.gateway.hostname}:${app.config.servicesInfo.gateway.port}/`;
  class gatewayProxy extends app.Service {
    async setCache(key, value) {
      try {
        await axios.put('/api/v1/base/caches/' + key, { value }, {
          baseURL: gatewayAddress,
          headers: {
            Authorization: this.ctx.headers.authorization,
          },
        });
      } catch (e) {
        this.ctx.logger.warn(e);
      }
    }

    async delCache(key) {
      try {
        await axios.delete('/api/v1/base/caches/' + key, {
          baseURL: gatewayAddress,
          headers: {
            Authorization: this.ctx.headers.authorization,
          },
        });
      } catch (e) {
        this.ctx.logger.warn(e);
      }
    }

    async post(path, data) {
      await axios.post(path, data, {
        baseURL: gatewayAddress,
        headers: {
          Authorization: this.ctx.headers.authorization,
        },
      });
    }
  }
  return gatewayProxy;
};
