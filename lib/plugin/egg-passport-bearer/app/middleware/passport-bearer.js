module.exports = (options, app) => {
  return async function(ctx, next) {
    await app.passport.authenticate('bearer', {
      session: false,
      successReturnToOrRedirect: false,
      successRedirect: false,
      // failureRedirect: ctx.path,
      failWithError: false,
    })(ctx, () => { return; });

    // don't let authenticate change the status code;
    ctx.status = 404;
    ctx.response._explicitStatus = false;
    ctx.type = '';
    await next();
  };
};

