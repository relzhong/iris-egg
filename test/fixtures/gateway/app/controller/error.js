const createError = require('http-errors');
const { UniqueConstraintError } = require('sequelize');
module.exports = app => {

  class ErrorController extends app.Controller {
    async index() {
      throw 'Error';
    }

    async uniqueError() {
      throw new UniqueConstraintError();
    }

    async http400Error() {
      throw createError(400, 'error');
    }

    async http401Error() {
      throw createError(401, 'error');
    }

    async http404Error() {
      throw createError(404, 'error');
    }

    async http500Error() {
      throw createError(500, 'error');
    }

    async http401ErrorCode() {
      throw createError(401, 'error', { code: 1007 });
    }

    async http500ErrorPost() {
      throw createError(500, 'error');
    }
    async http500ErrorGetUA() {
      this.ctx.headers['user-agent'] = '';
      throw createError(500, 'error');
    }
  }

  return ErrorController;
};

