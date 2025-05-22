const { DataTypes, Model } = require("sequelize");

class OrdenExamen extends Model {
  static initModel(sequelize) {
    OrdenExamen.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        ordenId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "orden_id",
        },
        examenId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "examen_id",
        },
      },
      {
        sequelize,
        modelName: "OrdenExamen",
        tableName: "ordenes_examen",
        timestamps: false,
      }
    );
    return OrdenExamen;
  }

  static associate(models) {
    OrdenExamen.belongsTo(models.OrdenTrabajo, {
      foreignKey: "ordenId",
      as: "ordenTrabajo",
    });
    OrdenExamen.belongsTo(models.Examen, {
      foreignKey: "examenId",
      as: "examen",
    });
    OrdenExamen.hasOne(models.Muestra, {
      foreignKey: "ordenExamenId",
      as: "muestra",
    });
  }
}

module.exports = OrdenExamen;

