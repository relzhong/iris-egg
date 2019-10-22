exports.sequelize = {
  dialect: process.env.DB_DIALECT, // support: mysql, mariadb, postgres, mssql
  database: process.env.DB_NAME,
  host: process.env.DB_HOST ? process.env.DB_HOST : 'DB',
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  pool: {
    max: 20,
    min: 5,
    idle: 4000,
  },
};
