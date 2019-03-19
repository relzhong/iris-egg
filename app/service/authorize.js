const createError = require('http-errors');
const moment = require('moment');
const R = require('ramda');

module.exports = app => {
  const uuidv4 = require('uuid/v4');
  const bcrypt = require('bcrypt');
  class Authorize extends app.Service {
    async token(username, password, phone) {
      const { ctx } = this;
      const where = {};
      if (username) where.username = username;
      if (phone) where.phone = phone;
      const cache = app.cache.get(app.config.cache.defaultClient);
      const user = await ctx.repository.User.findOne({ include: [{
        model: ctx.repository.UserGroup,
      }], where });
      if (user && user.status === 1) {
        if (await bcrypt.compare(password, user.password)) {
          user.lastLoginTime = user.loginTime ? user.loginTime : new Date();
          user.loginTime = moment().toISOString();
          await user.save();
          const token = this.createToken();
          const tokens = await cache.wrap(`userTokens_${user.id}`, []);
          await cache.set(`userTokens_${user.id}`, R.insert(0, token, tokens).slice(0, app.config.authorize.maxClient), { ttl: app.config.authorize.refreshTokenExpireTime });
          await cache.set(`userIdAT_${token.accessToken}`, user.id, { ttl: app.config.authorize.refreshTokenExpireTime });
          await cache.set(`userIdRT_${token.refreshToken}`, user.id, { ttl: app.config.authorize.refreshTokenExpireTime });
          app.messenger.sendToApp('cache-set', { key: `userTokens_${user.id}`, value: R.insert(0, token, tokens).slice(0, app.config.authorize.maxClient), option: { ttl: app.config.authorize.refreshTokenExpireTime } });
          app.messenger.sendToApp('cache-set', { key: `userIdAT_${token.accessToken}`, value: user.id, option: { ttl: app.config.authorize.refreshTokenExpireTime } });
          app.messenger.sendToApp('cache-set', { key: `userIdRT_${token.refreshToken}`, value: user.id, option: { ttl: app.config.authorize.refreshTokenExpireTime } });
          return { accessToken: token.accessToken, refreshToken: token.refreshToken, expiresIn: app.config.authorize.expiresIn };
        }
        throw createError(401, null, { code: 1004 });
      }
      throw createError(401, null, { code: 1003 });
    }

    async tokenWechat(openid) {
      const { ctx } = this;
      const cache = app.cache.get(app.config.cache.defaultClient);
      const user = await ctx.repository.User.findOne({ include: [{
        model: ctx.repository.UserGroup,
      }], where: { openid } });
      if (user && user.status === 1) {
        user.lastLoginTime = user.loginTime ? user.loginTime : new Date();
        user.loginTime = moment().toISOString();
        await user.save();
        const token = this.createToken();
        const tokens = await cache.wrap(`userTokens_${user.id}`, []);
        await cache.set(`userTokens_${user.id}`, R.insert(0, token, tokens).slice(0, app.config.authorize.maxClient), { ttl: app.config.authorize.refreshTokenExpireTime });
        await cache.set(`userIdAT_${token.accessToken}`, user.id, { ttl: app.config.authorize.refreshTokenExpireTime });
        await cache.set(`userIdRT_${token.refreshToken}`, user.id, { ttl: app.config.authorize.refreshTokenExpireTime });
        app.messenger.sendToApp('cache-set', { key: `userTokens_${user.id}`, value: R.insert(0, token, tokens).slice(0, app.config.authorize.maxClient), option: { ttl: app.config.authorize.refreshTokenExpireTime } });
        app.messenger.sendToApp('cache-set', { key: `userIdAT_${token.accessToken}`, value: user.id, option: { ttl: app.config.authorize.refreshTokenExpireTime } });
        app.messenger.sendToApp('cache-set', { key: `userIdRT_${token.refreshToken}`, value: user.id, option: { ttl: app.config.authorize.refreshTokenExpireTime } });
        return { accessToken: token.accessToken, refreshToken: token.refreshToken, expiresIn: app.config.authorize.expiresIn };
      }
      throw createError(401, null, { code: 1003 });
    }

    async refresh(refreshToken) {
      const cache = app.cache.get(app.config.cache.defaultClient);
      const userId = await cache.get(`userIdRT_${refreshToken}`);
      if (!userId) throw createError(401, null, { code: 1002 });
      const tokens = await cache.wrap(`userTokens_${userId}`, []);
      const tokenIndex = R.findIndex(R.propEq('refreshToken', refreshToken))(tokens);
      if (tokenIndex === -1) throw createError(401, null, { code: 1002 });
      if (((new Date()).getTime() - tokens[tokenIndex].expireTime > app.config.authorize.refreshTokenExpireTime * 1000)) {
        throw createError(401, null, { code: 1002 });
      }
      const token = this.createToken();
      tokens[tokenIndex] = token;
      await cache.set(`userTokens_${userId}`, tokens, { ttl: app.config.authorize.refreshTokenExpireTime });
      await cache.set(`userIdAT_${token.accessToken}`, userId, { ttl: app.config.authorize.refreshTokenExpireTime });
      await cache.set(`userIdRT_${token.refreshToken}`, userId, { ttl: app.config.authorize.refreshTokenExpireTime });
      app.messenger.sendToApp('cache-set', { key: `userTokens_${userId}`, value: tokens, option: { ttl: app.config.authorize.refreshTokenExpireTime } });
      app.messenger.sendToApp('cache-set', { key: `userIdAT_${token.accessToken}`, value: userId, option: { ttl: app.config.authorize.refreshTokenExpireTime } });
      app.messenger.sendToApp('cache-set', { key: `userIdRT_${token.refreshToken}`, value: userId, option: { ttl: app.config.authorize.refreshTokenExpireTime } });
      return { accessToken: token.accessToken, refreshToken: token.refreshToken, expiresIn: app.config.authorize.expiresIn };
    }

    async revoke(id) {
      const { ctx } = this;
      const cache = app.cache.get(app.config.cache.defaultClient);
      const user = await ctx.repository.User.findById(id);
      if (user && user.status === 1) {
        await cache.set(`userTokens_${user.id}`, []);
        app.messenger.sendToApp('cache-set', { key: `userTokens_${user.id}`, value: [] });
      } else {
        throw createError(403, 'revoke fail', { code: 1006 });
      }
    }

    createToken() {
      const token = {};
      token.accessToken = uuidv4();
      token.refreshToken = uuidv4();
      token.expireTime = (new Date()).getTime() + app.config.authorize.expiresIn * 1000;
      return token;
    }

  }
  return Authorize;
};
