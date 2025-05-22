const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

// Importa la configuración de conexión y extrae la instancia de Sequelize
const Conexion = require("../config/dbConfig");
const sequelize = Conexion.sequelize;

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const modelClass = require(path.join(__dirname, file));
    if (typeof modelClass.initModel === "function") {
      const model = modelClass.initModel(sequelize);
      db[model.name] = model;
    }
  });

// Ejecutar las asociaciones 
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

// Sincronizar los modelos con la base de datos
sequelize
  .sync({ alter: true }) // cambiar a { force: true } para desarrollo
  .then(() => {
    console.log("¡Tablas creadas o actualizadas con éxito!");
  })
  .catch((err) => {
    console.error("Error al sincronizar la base de datos:", err);
  });

module.exports = db;
