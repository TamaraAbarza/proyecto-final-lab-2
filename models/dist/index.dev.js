"use strict";

var fs = require("fs");

var path = require("path");

var Sequelize = require("sequelize");

var basename = path.basename(__filename);
var db = {}; // Importa la configuración de conexión y extrae la instancia de Sequelize

var Conexion = require("../config/dbConfig");

var sequelize = Conexion.sequelize;
fs.readdirSync(__dirname).filter(function (file) {
  return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
}).forEach(function (file) {
  var modelClass = require(path.join(__dirname, file));

  if (typeof modelClass.initModel === "function") {
    var model = modelClass.initModel(sequelize);
    db[model.name] = model;
  }
}); // Ejecutar las asociaciones 

Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize; // Sincronizar los modelos con la base de datos

sequelize.sync({
  alter: true
}) // cambiar a { force: true } para desarrollo
.then(function () {
  console.log("¡Tablas creadas o actualizadas con éxito!");
})["catch"](function (err) {
  console.error("Error al sincronizar la base de datos:", err);
});
module.exports = db;