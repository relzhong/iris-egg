const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const debug = require('debug')('egg-passport-jwt');

module.exports = app => {
  const config = app.config.passportJWT;
  const opts = {};
  // jwt 配置，默认从cookie中获取数据
  // opts.jwtFromRequest = function(req) {
  //   const cookie = require('cookie');
  //   let token = null;
  //   if (req && req.headers.cookie) {
  //     const cookies = cookie.parse(req.headers.cookie);
  //     token = cookies.jwt;
  //   }
  //   return token;
  // };
  opts.jwtFromRequest = ExtractJwt.fromHeader('jwt');
  opts.secretOrKey = config.jwtKey;
  opts.passReqToCallback = true;
  opts.algorithms = config.options.algorithms;
  app.passport.use('jwt', new JwtStrategy(opts, function(req, jwtPayload, done) {
    debug('get user: ', jwtPayload.user);
    app.passport.doVerify(req, jwtPayload.user, done);
  }));

  app.passport.verify(async function(ctx, user) {
    if (user) {
      return user;
    }
    return false;
  });

  app.config.coreMiddleware.push('passportJwt');
};
