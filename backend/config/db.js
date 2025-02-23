const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {

  host: config.DB_HOST,
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
