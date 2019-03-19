const util = require('util');

class ContextLogger extends require('egg-logger').EggContextLogger {
  get paddingMessage() {
    const ctx = this.ctx;
    const rs = ctx.starttime ? Date.now() - ctx.starttime : 0;
    const ip = ctx.get('X-Real-IP') || ctx.ip;
    const port = ctx.get('X-Real-Port');
    const protocol = ctx.protocol.toUpperCase();
    const method = ctx.method;
    const url = ctx.url;
    const status = ctx.status;
    const length = ctx.length || '-';
    const referrer = ctx.get('referrer') || '-';
    const serverTime = ctx.response.get('X-Server-Response-Time') || '-';
    const operator = ctx.user ? ctx.user.id : '-';
    const message = util.format('%s:%s - %s %s %s/%s %s %s %s %s %s',
      ip, port, method, url, protocol, status, length, referrer, rs, serverTime, operator);
    return '[context] ' + message;
  }
}

module.exports = ContextLogger;
