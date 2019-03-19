const crypto = require('crypto');
const xml2js = require('xml2js');

module.exports = {
  md5(text, encoding) {
    return crypto.createHash('md5').update(this.bufferStr(text), 'utf8').digest(encoding || 'hex');
  },

  bufferStr(value) {
    return Buffer.isBuffer(value) ? value : this.toStr(value);
  },

  toStr(value) {
    return (value || value === 0) ? (value + '') : '';
  },

  parseXML(xml) {
    return new Promise((resolve, reject) => {
      const opt = { trim: true, explicitArray: false, explicitRoot: false };
      xml2js.parseString(xml, opt, (err, res) => (err ? reject(new Error('XMLDataError')) : resolve(res || {})));
    });
  },

  buildXML(obj, rootName = 'xml') {
    const opt = { xmldec: null, rootName, allowSurrogateChars: true, cdata: true };
    return new xml2js.Builder(opt).buildObject(obj);
  },

  parsePrice(req) {
    const money = req.split('.');
    const yuan = money[0] ? parseInt(money[0]) * 100 : 0;
    const fen = money[1] ? parseInt(money[1]) : 0;
    return yuan + fen;
  },

  buildPrice(money) {
    const yuan = Math.floor(money / 100);
    const fen = money % 100;
    const addi = (fen < 10) ? '0' : '';
    return `${yuan}.${addi}${fen}`;
  },
};
