const R = require('ramda');

class AppBootHook {

  constructor(app) {
    
    const middleware = [ 'restc', 'access', 'logger', 'notFoundHandler' ];
    if (process.env.IRIS_EGG_GATEWAY) {
      middleware.splice(3, 0, 'routerProxy');
    }
    app.config.appMiddleware.unshift(...middleware);
  
    app.logger.info('[Framework Middleware]', '' + app.config.coreMiddleware);
    app.logger.info('[App Middleware]', '' + app.config.appMiddleware);
  
    app.messenger.on('cache-set', async data => {
      const cache = app.cache.get(app.config.cache.defaultClient);
      await cache.set(data.key, data.value, data.option);
    });
  
    app.messenger.on('cache-del', async data => {
      const cache = app.cache.get(app.config.cache.defaultClient);
      await cache.del(data.key);
    });

    /**
     * 自定义controller
     */
    class CustomController extends app.Controller {
      /**
       * 封装body，默认error:0
       * @param {string} data 返回数据
       */
      success(data) {
        if (data && data.toJSON) { // a sequelize instance
          data = data.toJSON();
        }
        if (data && data.rows) {
          if (data.rows instanceof Array) {
            data.rows = data.rows.map(r => {
              if (r.toJSON) { r = r.toJSON(); }
              return R.omit([ 'created_at', 'updated_at' ], r);
            });
          }
        } else {
          data = R.omit([ 'created_at', 'updated_at' ], data);
        }
        this.ctx.body = {
          error: 0,
          data,
        };
      }
      /**
       * 封装body，默认error:0
       * @param {number} error 错误states code
       * @param {string} data 返回数据
       */
      error(error, data) {
        this.ctx.body = {
          error,
          data,
        };
      }
      /**
       * 简化request.post获取
       * @param {string} key 入参key
       * @return {string} 返回body[key]
       */
      get POST() {
        return Object.assign(this.ctx.request.body, this.ctx.params);
      }
      /**
       * 简化request.get获取
       * @param {string} key 入参key
       * @return {string} 返回body[key]
       */
      get GET() {
        return Object.assign(this.ctx.request.query, this.ctx.params);
      }
    }

    app.Controller = CustomController;
    this.app = app;
  }

  async didLoad() {
    const app = this.app;
    // 应用会等待这个函数执行完成才启动
    if (app.plugins.passportBearer) {
      app.passport.verify(async function(ctx, accessToken) {
        const cache = app.cache.get(app.config.cache.defaultClient);
        const userId = await cache.get(`userIdAT_${accessToken}`);
        if (!userId) return false;
        const tokens = await cache.wrap(`userTokens_${userId}`, []);
        if (!tokens instanceof Array) return false;
        const token = R.find(R.propEq('accessToken', accessToken))(tokens);
        if (!token) return false;
        if ((new Date()).getTime() > token.expireTime) return false;
        const user = await cache.wrap(`userInfo_${userId}`, async () => {
          let res = await ctx.repository.User.findOne({
            include: [{
              model: ctx.repository.UserGroup,
            }],
            where: { id: userId },
          });
          if (res) {
            res = res.toJSON();
            res.userGroupIds = res.UserGroups.map(userGroup => userGroup.id);
            res = ctx.helper.infoFilter(res);
            res.jwt = ctx.helper.createJwtPayload(res);
            return res;
          }
          return undefined;
        }, { ttl: app.config.passportJWT.options.expiresIn - 100 });
        if (!user) {
          return false;
        }
        return user;
      });
    }
  }
};

module.exports = AppBootHook;