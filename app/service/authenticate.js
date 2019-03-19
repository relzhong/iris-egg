const createError = require('http-errors');
const R = require('ramda');
const casbin = require('casbin');
const { Helper } = require('casbin');

module.exports = app => {
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

  class Authenticate extends app.Service {
    async policyValidate() {
      const { ctx } = this;
      const defaultEnforcer = await prepareEnforcer();
      const cache = app.cache.get(app.config.cache.defaultClient);
      if (ctx.method === 'OPTIONS') return;
      if (defaultEnforcer.enforce(ctx.path, ctx.method)) return;
      if (!ctx.user) {
        throw createError(401, 'no user in ctx', { code: 1002 });
      }
      // get policyTemplates of all user's userGroup and user.
      let templateIds = [];
      const userPolicyIds = await cache.wrap(`userPolicyIds_${ctx.user.id}`, async () => {
        const user = await ctx.repository.User.findById(ctx.user.id);
        const policies = await user.getAuthPolicies();
        return policies.map(policy => policy.id);
      });
      templateIds = templateIds.concat(userPolicyIds);
      const policyPromises = ctx.user.userGroupIds.map(async userGroupId => {
        const userGroupPolicyIds = await cache.wrap(`userGroupPolicyIds_${userGroupId}`, async () => {
          const userGroup = await ctx.repository.UserGroup.findById(userGroupId);
          if (!userGroup) return [];
          const policies = await userGroup.getAuthPolicies();
          return policies.map(policy => policy.id);
        });
        templateIds = templateIds.concat(userGroupPolicyIds);
      });
      await Promise.all(policyPromises);
      const policyTemplateIds = R.uniq(templateIds);
      let policyTemplates = [];
      const promises = policyTemplateIds.map(async policyTemplateId => {
        const authPolicy = await cache.wrap(`authPolicy_${policyTemplateId}`, async () => {
          // build casbin
          const policyTemplate = await ctx.repository.AuthPolicy.findById(policyTemplateId);
          try {
            const template = JSON.parse(policyTemplate.template);
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
            return policies;
          } catch (e) {
            return '';
          }
        });
        policyTemplates.push(authPolicy);
      });
      await Promise.all(promises);
      policyTemplates = R.flatten(policyTemplates);
      const enforcer = await casbin.newEnforcer(casbin.newModel(app.config.authenticate.model.router));
      policyTemplates.forEach(p => Helper.loadPolicyLine(p, enforcer.getModel()));
      if (!enforcer.enforce(ctx.path, ctx.method)) {
        throw createError(401, `no permission ${ctx.method} ${ctx.path}`, { code: 1005 });
      }
    }
  }
  return Authenticate;
};
