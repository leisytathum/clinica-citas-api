// Conexión a MySQL usando Sequelize
require('dotenv').config({ quiet: true });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false  // pon true si quieres ver las consultas SQL en consola
  }
);

module.exports = sequelize;