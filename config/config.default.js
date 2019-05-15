'use strict';
const path = require('path');
const { UniqueConstraintError } = require('sequelize');
const datasources = require('./datasources');

module.exports = app => {
  const config = {};

  config.sequelize = datasources.sequelize;

  config.onerror = {
    all(err, ctx) {
      if (err instanceof UniqueConstraintError) {
        err.status = 403; err.code = 1009;
      }
      if (!err.status) err.status = 500;
      if (err.status && !err.code) {
        if (ctx.app.config.env === 'prod') {
          // 生产环境时错误的详细错误内容不返回给客户端，因为可能包含敏感信息
          ctx.body.message = ctx.app.config.dicts.errorCode[ctx.body.error];
        }
        switch (err.status) {
          case 400: err.code = 1001; break;
          case 401: err.code = 1002; break;
          case 500: err.code = 1000; break;
          default: break;
        }
      }
      if (err.status) {
        ctx.body = { error: err.code, message: err.message };
      }
      if (ctx.request.method !== 'GET') {
        ctx.logger.info({
          query: ctx.query,
          queries: ctx.queries,
          params: ctx.params,
          reqBody: ctx.request.body,
        });
      } else {
        ctx.logger.info(ctx.get('user-agent') || '');
      }
    },
    accepts() {
      return 'json';
    },
  };

  config.access = {
    defaultPolicies: `[]`,
  };

  config.authorize = {
    expiresIn: 7200,
    refreshTokenExpireTime: 30 * 24 * 60 * 60, // 1 month
  };

  config.logrotator = {
    maxDays: 0,
  }

  // 覆盖egg自带的配置
  config.bodyParser = {
    enable: true,
    encoding: 'utf8',
    formLimit: '10mb',
    jsonLimit: '10mb',
    strict: true,
    // @see https://github.com/hapijs/qs/blob/master/lib/parse.js#L8 for more options
    queryString: {
      arrayLimit: 100,
      depth: 5,
      parameterLimit: 1000,
    },
    enableTypes: [ 'json', 'form', 'text' ],
    extendTypes: {
      text: [ 'text/xml', 'application/xml' ],
    },
  };

  config.customLogger = {
    datasourceLogger: {
      file: path.join(app.baseDir, 'logs/datasource.log'),
    },
    channelLogger: {
      file: path.join(app.baseDir, 'logs/channel.log'),
    },
  };

  config.authorize = {
    maxClient: 10,
    expiresIn: 7200,
    refreshTokenExpireTime: 30 * 24 * 60 * 60, // 1 month
  };

  config.session = {
    enable: false,
  };

  config.development = { ignoreDirs: [ 'app/web-mobile', 'app/web' ] };

  config.i18n = {
    defaultLocale: 'zh-CN',
    queryField: 'locale',
    cookieField: 'locale',
  };

  config.passportJWT = {
    jwtKey: 'iriscv_egg',
    options: {
      algorithm: 'HS256',
      expiresIn: 24 * 60 * 60, // 1 天
    },
  };

  config.joi = {
    options: {
      // allowUnknown: true,
    },
    locale: {
      'zh-CN': {},
    },
  };

  config.cors = {
    credentials: true,
  };

  config.graphql = {
    router: '/graphql',
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
    // 是否加载开发者工具 graphiql, 默认开启。路由同 router 字段。使用浏览器打开该可见。
    graphiql: true,
    // graphQL 路由前的拦截器
    // async onPreGraphQL(ctx, next) {},
    // 开发工具 graphiQL 路由前的拦截器，建议用于做权限操作(如只提供开发者使用)
    // async onPreGraphiQL(ctx, next) {},
  };

  config.datasource = { };

  config.dicts = {
    errorCode: require('./dicts/error-code'),
  };

  config.cache = {
    clients: {
      memory: {
        store: 'memory',
        max: 100,
        ttl: 600,
      },
      // redis: { // full config: https://github.com/dabroek/node-cache-manager-ioredis#single-store
      //   driver: redisStore,
      //   host: 'dev.lbsmed.com',
      //   port: 9201,
      //   password: '',
      //   db: 0,
      //   ttl: 600,
      // },
    },
    // multiCaching: {
    //   memredis: [ 'memory', 'redis' ],
    // },
    default: {
    },
    defaultClient: 'memory',
  };

  config.authenticate = {
    model: {
      router: `[request_definition]
      r = obj, act
      
      [policy_definition]
      p = obj, act, eft
      
      [policy_effect]
      e = priority(p.eft) || deny
      
      [matchers]
      m = keyMatch2(r.obj, p.obj) && regexMatch(r.act, p.act)`,
    },
  };

  config.keys = app.name + '_iris_egg';

  config.logger = {
    consoleLevel: 'INFO',
    dir: path.join(app.baseDir, 'logs'),
  };

  config.servicesInfo = {
    hau: {
      hostname: 'HAU',
      port: 7001,
    },
    iu: {
      hostname: 'IU',
      port: 7001,
    },
    pu: {
      hostname: 'PU',
      port: 7001,
    },
    ku: {
      hostname: 'KU',
      port: 7001,
    },
    chu: {
      hostname: 'CHU',
      port: 7001,
    },
    hru: {
      hostname: 'HRU',
      port: 7001,
    },
    gateway: {
      hostname: 'GATEWAY',
      port: 7001,
    },
  };

  if (process.env.DOMAIN_WHITE_LIST) {
    config.security = {
      domainWhiteList: process.env.DOMAIN_WHITE_LIST.split(','),
      csrf: {
        enable: false,
      },
    };
  }

  return config;
};
