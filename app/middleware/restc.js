const restc = require('restc');

module.exports = () => {
  return restc.koa2({
    includes: [ '/api' ],
  });
};
