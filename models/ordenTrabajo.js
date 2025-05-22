const { DataTypes, Model } = require("sequelize");

class OrdenTrabajo extends Model {
  static initModel(sequelize) {
    OrdenTrabajo.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        pacienteId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "paciente_id",
        },
        diagnostico: {
          type: DataTypes.TEXT,
          allowNull: false,
          field: "diagnostico",
        },
        fechaCreacion: { type: DataTypes.DATE, field: "fecha_creacion" },
        fechaEntrega: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "fecha_entrega",
        },
        estado: {
          type: DataTypes.ENUM(
            "esperando toma de muestra",
            "analítica",
            "pre informe",
            "para validar",
            "informada"
          ),
          defaultValue: "esperando toma de muestra",
          field: "estado",
        },
        observaciones: {
          type: DataTypes.TEXT,
          field: 'observaciones'
        }
      },
      {
        sequelize,
        modelName: "OrdenTrabajo",
        tableName: "ordenes_trabajo",
        timestamps: false,
      }
    );
    return OrdenTrabajo;
  }

  static associate(models) {
    OrdenTrabajo.hasMany(models.OrdenExamen, {
      foreignKey: "ordenId",
      as: "ordenesExamenes",
    });
    OrdenTrabajo.belongsTo(models.Paciente, {
      foreignKey: "pacienteId",
      as: "paciente",
    });
    OrdenTrabajo.hasMany(models.Resultado, {
      foreignKey: "ordenId",
      as: "resultados",
    });
    OrdenTrabajo.hasMany(models.HistorialEstadosOrden, {
      foreignKey: "ordenId",
      as: "historialEstadosOrden",
    });
  }
}

module.exports = OrdenTrabajo;

