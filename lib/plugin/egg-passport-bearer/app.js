const BearerStrategy = require('passport-http-bearer').Strategy;
const debug = require('debug')('egg-passport-bearer');

module.exports = app => {
  app.passport.use('bearer', new BearerStrategy({ passReqToCallback: true }, function(ctx, token, done) {
    debug('get token: ', token);
    app.passport.doVerify(ctx, token, done);
  }));

  app.config.coreMiddleware.push('passportBearer');
};
