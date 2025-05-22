// models/determinacion.js
const { DataTypes, Model } = require("sequelize");

class Determinacion extends Model {
  static initModel(sequelize) {
    Determinacion.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombreDeterminacion: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "nombre_determinacion",
        },
        unidadMedida: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "unidad_medida",
        },
        examenId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "examen_id",
        },
        estado: { type: DataTypes.BOOLEAN, allowNull: true },
      },
      {
        sequelize,
        modelName: "Determinacion",
        tableName: "determinaciones",
        timestamps: false,
      }
    );
    return Determinacion;
  }

  static associate(models) {
    Determinacion.belongsTo(models.Examen, {
      foreignKey: "examenId",
      as: "examen",
    });
    Determinacion.hasMany(models.ValorReferencia, {
      foreignKey: "determinacionId",
      as: "valoresReferencia",
    });
    Determinacion.hasMany(models.Resultado, {
      foreignKey: "determinacionId",
      as: "resultados",
    });
  }
}

module.exports = Determinacion;
