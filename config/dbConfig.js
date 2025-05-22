const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

class Conexion {
  static sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialect: process.env.DB_DIALECT,
    database: process.env.DB_NAME,
    logging: false,
  });
  static async conectar() {
    try {
      await Conexion.sequelize.authenticate();
      console.log("Conexión exitosa a la base de datos");
    } catch (error) {
      console.error("Error al conectar a la base de datos:", error);
      process.exit(1);
    }
  }
}

module.exports = Conexion;