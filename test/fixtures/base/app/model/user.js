module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const User = app.model.define('User', { // 模型json结构
    username: {
      type: STRING(36),
      allowNull: false,
      unique: true,
      comment: '用户名',
    },
    password: {
      type: STRING(64),
      allowNull: false,
      unique: false,
      comment: '密码',
    },
    name: {
      type: STRING(20),
      allowNull: true,
      unique: false,
      comment: '昵称/姓名',
    },
    phone: {
      type: STRING(20),
      allowNull: true,
      unique: false,
      comment: '手机号码',
    },
    email: {
      type: STRING(40),
      allowNull: true,
      unique: true,
      comment: '邮箱',
    },
    idCard: {
      type: STRING(18),
      allowNull: true,
      unique: true,
      comment: '身份证号',
    },
    address: {
      type: STRING,
      allowNull: true,
      unique: false,
      comment: '用户地址',
    },
    headImgURL: {
      type: STRING,
      allowNull: true,
      unique: false,
      comment: '用户头像',
    },
    sex: {
      type: INTEGER,
      allowNull: true,
      unique: false,
      defaultValue: 1,
      comment: '用户性别',
    },
    birthday: {
      type: DATE,
      allowNull: true,
      unique: false,
      comment: '出生年月',
    },
    lastLoginTime: {
      type: DATE,
      allowNull: true,
      unique: false,
      comment: '上次登陆时间',
    },
    loginTime: {
      type: DATE,
      allowNull: true,
      unique: false,
      comment: '本次登陆时间',
    },
    description: {
      type: STRING(100),
      allowNull: true,
      unique: false,
      comment: '用户描述',
    },
    type: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 1,
      unique: false,
      comment: '用户类型',
    },
    openid: {
      type: STRING(64),
      allowNull: true,
      unique: true,
      comment: '微信openid/unionid',
    },
    status: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 1,
      unique: false,
      comment: '状态',
    },

  }, {
    comment: '用户表',
    timestamps: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    freezeTableName: true,
    tableName: 'iu_user',
  });

  return User;
};
