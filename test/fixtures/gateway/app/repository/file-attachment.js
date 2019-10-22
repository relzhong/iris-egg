/** @module repository/FileAttachment */

module.exports = () => {
  //  const request = app.connector.kingdeeCommon.request;

  /**
     * @property {string} fileId 附件编号.
     * @property {string} imgUrl 图片路径.
     * @property {string} smallImageUrl 小图路径.
     * @property {string} size 图片大小.
     * @property {string} type 类型.
     * @property {string} extend 补充.
     * @property {Object} _raw his接口原始数据.
     */
  class FileAttachment {
    /**
       * repository fileAttachment.
       * @param {string} fileId 附件编号.
       * @param {string} imgUrl 图片路径.
       * @param {string} smallImageUrl 小图路径.
       * @param {string} size 图片大小.
       * @param {string} type 类型.
       * @param {string} extend 补充.
       */
    constructor(fileId, imgUrl, smallImageUrl, size, type, extend) {
      Object.assign(this, {
        fileId, imgUrl, smallImageUrl, size, type, extend,
      });
    }

    static getType() {
      return 'adapter';
    }
  }
  return FileAttachment;
};

