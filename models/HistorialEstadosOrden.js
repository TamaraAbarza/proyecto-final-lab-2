const { DataTypes, Model } = require("sequelize");

class HistorialEstadosOrden extends Model {
  static initModel(sequelize) {
    HistorialEstadosOrden.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        ordenId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "orden_id",
        },
        estadoNuevo: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: "estado_nuevo",
        },
        descripcion: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "descripcion",
        },
        usuarioId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "usuario_id",
        },
      },
      {
        sequelize,
        modelName: "HistorialEstadosOrden",
        tableName: "historial_estados_orden",
        timestamps: true,
        updatedAt: false,
      }
    );
    return HistorialEstadosOrden;
  }

  static associate(models) {
    HistorialEstadosOrden.belongsTo(models.OrdenTrabajo, {
      foreignKey: 'ordenId',
      as: 'ordenTrabajo',
    });

    HistorialEstadosOrden.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario',
    });
  }
}

module.exports = HistorialEstadosOrden;