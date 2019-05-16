module.exports = () => {
  return async function(ctx, next) {
    await ctx.service.authenticate.policyValidate();
    await next();
  };
};

