const { DataTypes, Model } = require("sequelize");

class Resultado extends Model {
  static initModel(sequelize) {
    Resultado.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        muestraId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "muestra_id",
        },
        determinacionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "determinacion_id",
        },
        ordenId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "orden_id",
        },
        valorFinal: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: "valor_final",
        },
        fechaResultado: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "fecha_resultado",
        },
      },
      {
        sequelize,
        modelName: "Resultado",
        tableName: "resultados",
        timestamps: false,
      }
    );
    return Resultado;
  }

  static associate(models) {
    Resultado.belongsTo(models.Muestra, {
      foreignKey: "muestraId",
      as: "muestra",
    });
    Resultado.belongsTo(models.Determinacion, {
      foreignKey: "determinacionId",
      as: "determinacion",
    });
    Resultado.belongsTo(models.OrdenTrabajo, {
      foreignKey: "ordenId",
      as: "ordenTrabajo",
    });
  }
}

module.exports = Resultado;
