const R = require('ramda');
const qs = require('qs');

module.exports = {
  /**
   * validate data with schema
   * @param  {Object} schema  - validate schema object)
   * @param  {Object} data - validate target, default to `this.request.body` or this.request.query
   * @param  {Object} config - default app.config.joi
   * @return {Object} error jai error.
   */
  validate(schema, data, config) {
    if (!schema || !schema.isJoi) {
      return { error: 'schema no found!' };
    }
    let reqData = data || R.merge(this.params, this.request.body);
    if (this.request.method === 'GET') {
      reqData = data || R.merge(this.params, qs.parse(this.request.querystring, { arrayLimit: 200 }));
    }
    const defaultConfig = this.app.config || {};
    let languageConfig = {};
    const locale = (this.__getLocale && this.__getLocale()) || (defaultConfig.i18n && defaultConfig.i18n.defaultLocale);

    if (locale && defaultConfig.joi && defaultConfig.joi.locale) {
      languageConfig = defaultConfig.joi.locale[locale] || {};
    }
    const result = this.app.Joi.validate(reqData, schema, Object.assign({}, (defaultConfig.joi && defaultConfig.joi.options), { language: languageConfig }, config));
    if (result.error) {
      this.app.logger.debug('[joi]', result.error.details);
      result.error = R.reduce(R.concat, '', R.map(detail => detail.message + '  ', result.error.details));
    }
    return result;
  },

  /**
   * Validates a value against a schema and throws if validation fails where
   * @param  {Object} schema  - validate schema object)
   * @param  {Object} data - validate target, default to `this.request.body` or this.request.query
   * @param  {Object} message - optional message string prefix added in front of the error message. may also be an Error object.
   */
  assert(schema, data, message) {
    if (!schema || !schema.isJoi) {
      this.throw(400, 'schema no found!');
    }
    let reqData = data || this.request.body;
    if (this.request.method === 'GET') {
      reqData = data || this.request.query;
    }
    this.app.Joi.assert(reqData, schema, message);
  },
};
