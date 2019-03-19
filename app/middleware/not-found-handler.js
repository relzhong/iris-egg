module.exports = () => {
  return async function(ctx, next) {
    await next();
    if ((ctx.status === 404 && ctx.body === 'Unauthorized') || (ctx.status === 404 && !ctx.body)) {
      if (ctx.acceptJSON) {
        ctx.body = { error: 'Not Found' };
        ctx.status = 404;
      } else {
        ctx.type = 'text/html;charser=UTF-8';
        ctx.body = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404错误</title><style>   ' +
        ' body{font-family: "Segoe UI", "Lucida Grande", Helvetica, Arial, "Microsoft YaHei";}    ' +
        'h1{      font-size: 26px;      color: #444;}    h1,h2{      display: inline-block;}    ' +
        'h2{      color: #ff0066;      font-size: 27px;}    .title{      margin-top: 15%;}    ' +
        '#main{      text-align: center;}    p{      font-size: 12px;      color: #999;}</style></head>' +
        '<body><div id="main"><div class="title"><h2>[404]</h2><h1>找不到相关页面</h1></div>' +
        '<p>We\'re sorry but the page your are looking for is Not Found...</p></div></body></html>';
        ctx.status = 404;
      }
    }
  };
};
