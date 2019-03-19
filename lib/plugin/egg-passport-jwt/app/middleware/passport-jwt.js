const R = require('ramda');
const casbin = require('casbin');
const { Helper } = require('casbin');

module.exports = (options, app) => {
  let defaultEnforcer = null;
  const prepareEnforcer = async function() {
    if (defaultEnforcer) return defaultEnforcer;
    let defaultPolicyTemplates = [];
    const defaultPolicies = JSON.parse(app.config.access.defaultPolicies);
    defaultPolicies.forEach(template => {
      if (!template) return '';
      if (!template.action instanceof Array) return '';
      if (!template.resource instanceof Array) return '';
      if (!template.effect) template.effect = 'allow';
      const policies = [];
      for (let i = 0; i < template.resource.length; i++) {
        if (template.resource[i].slice(0, 1) !== '/') continue;
        for (let j = 0; j < template.action.length; j++) {
          policies.push(`p, ${template.resource[i]}, ${template.action[j]}, ${template.effect}`);
        }
      }
      defaultPolicyTemplates.push(policies);
    });
    defaultPolicyTemplates = R.flatten(defaultPolicyTemplates);
    defaultEnforcer = await casbin.newEnforcer(casbin.newModel(app.config.authenticate.model.router));
    defaultPolicyTemplates.forEach(p => Helper.loadPolicyLine(p, defaultEnforcer.getModel()));
    return defaultEnforcer;
  };
  return async function(ctx, next) {
    if (ctx.method !== 'OPTIONS') {
      const defaultEnforcer = await prepareEnforcer();
      if (!defaultEnforcer.enforce(ctx.path, ctx.method)) {
        await app.passport.authenticate('jwt', {
          session: false,
          successReturnToOrRedirect: false,
          successRedirect: false,
          // failureRedirect: ctx.path,
          failWithError: true,
        })(ctx, () => { return; });
      } else {
        // no throw exception
        await app.passport.authenticate('jwt', {
          session: false,
          successReturnToOrRedirect: false,
          successRedirect: false,
          // failureRedirect: ctx.path,
          failWithError: false,
        })(ctx, () => { return; });
        // don't let authenticate change the status code;
        ctx.status = 404;
        ctx.response._explicitStatus = false;
        ctx.type = 'text/html';
      }
    }
    await next();
  };
};
