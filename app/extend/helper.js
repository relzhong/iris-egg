const jwt = require('jsonwebtoken');
const R = require('ramda');
const encode = require('./encode');
const urlPattern = require('url-pattern');

const helper = {
  /**
   * 过滤用户隐私信息
   * @param {object} user 待过滤user
   * @return {object} 已过滤user
   */
  infoFilter(user) {
    if (user.toJSON) {
      return R.omit([ 'password', 'accessToken', 'refreshToken', 'expireTime' ], user.toJSON());
    }
    return R.omit([ 'password', 'accessToken', 'refreshToken', 'expireTime' ], user);
  },

  /**
   * 匹配url
   * @param {object} path 待测试path
   * @param {object} pattens 待匹配规则
   * @return {object} 已过滤user
   */
  testUrl(path, pattens) {
    if (!pattens instanceof Array) {
      pattens = [ pattens ];
    }
    let result = false;
    pattens.forEach(patten => {
      if (patten && (new urlPattern(patten)).match(path) !== null) {
        result = true;
      }
    });
    return result;
  },

  /**
   * 匹配PolicyTemplate
   * @param {object} path 待测试path
   * @param {object} method 待测试method
   * @param {object} template 待匹配规则
   * @return {number} 匹配允许返回2 拒绝返回1 不命中返回0
   */
  testPolicyTemplate(path, method, template) {
    let hit = false;
    if (!template) return 0;
    if (!template.action instanceof Array) { template.action = []; }
    if (!template.resource instanceof Array) { template.action = []; }
    if (template.action.indexOf(method) > -1) {
      hit = helper.testUrl(path, template.resource);
    }
    if (hit) {
      if (template.effect === 'deny') {
        return 1;
      }
      return 2;
    }
    return 0;
  },
  /**
   * 创建 jwt payload,客户端保存
   * @param {object} user 待创建user
   * @param {object} jwtSignOption jwt参数, expiresIn 指定过期时间(秒)
   * @return {object} jwt payload
   */
  createJwtPayload(user, jwtSignOption) {
    if (!jwtSignOption) {
      jwtSignOption = {};
    }
    const data = {};
    data.user = user;
    const options = this.app.config.passportJWT.options;
    // 默认1000秒
    options.expiresIn = (new Date()).getTime() / 1000 + jwtSignOption.expiresIn ? jwtSignOption.expiresIn : options.expiresIn;
    return jwt.sign(data, this.app.config.passportJWT.jwtKey, options);
  },
  /**
   * 建立用户缓存，现在放到cookie 以后迁移到redis
   * @param {object} user 用户
   */
  async buildCustomerCache(user) {
    this.ctx.session.accessToken = user.accessToken;
  },
  /**
   * 梳理用户信息
   * @param {number} userId 用户id
   * @return {object} 返回用户对象
   */
  async buildCustomerInfo(userId) {
    const user = await this.ctx.repository.User.findById(userId);
    let userRaw = user.toJSON();
    userRaw = helper.infoFilter(userRaw);
    if (this.ctx.user && userId === this.ctx.user.id) {
      this.createJwtPayload(userRaw, {});
    }
    return userRaw;
  },

  encode, R,
};
module.exports = helper;

