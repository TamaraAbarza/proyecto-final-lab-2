const { DataTypes, Model } = require("sequelize");

class Examen extends Model {
  static initModel(sequelize) {
    Examen.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombreExamen: {
          type: DataTypes.STRING,
          allowNull: false,
          field: "nombre_examen",
        },
        tipoMuestra: {
          type: DataTypes.STRING,
          allowNull: false,
          field: "tipo_muestra",
        },
        descripcion: { type: DataTypes.TEXT, allowNull: true },
        codigo: { type: DataTypes.STRING, allowNull: false, unique: true },
        diasEstimadosResultados: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'dias_estimados_resultados'
        },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
      },
      {
        sequelize,
        modelName: "Examen",
        tableName: "examenes",
        timestamps: false,
      }
    );
    return Examen;
  }

  static associate(models) {
    Examen.hasMany(models.Determinacion, {
      foreignKey: "examenId",
      as: "determinaciones",
    });
    Examen.hasMany(models.OrdenExamen, {
      foreignKey: "examenId",
      as: "ordenesExamen",
    });
  }
}

module.exports = Examen;
