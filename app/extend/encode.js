const crypto = require('crypto');

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
};
