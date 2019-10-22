/** @module repository/User */

module.exports = () => {

  /**
     * @property {String} username 用户名.
     * @property {String} password 密码.
     * @property {String} name 姓名.
     * @property {String} phone 手机号.
     * @property {String} email 手机号.
     * @property {String} idCard 手机号.
     * @property {String} address 手机号.
     * @property {String} headImgURL 手机号.
     * @property {Number} sex 手机号.
     * @property {Date} birthday 手机号.
     * @property {String} lastLoginTime 手机号.
     * @property {String} headImgURL 手机号.
     * @property {String} headImgURL 手机号.
     * @property {String} type 类型.
     * @property {String} extend 补充.
     * @property {Object} _raw his接口原始数据.
     */
  class User {

    static getType() {
      return 'sequelizeModel';
    }
  }
  return User;
};

