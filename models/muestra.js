const { DataTypes, Model } = require("sequelize");

class Muestra extends Model {
  static initModel(sequelize) {
    Muestra.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        ordenExamenId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "orden_examen_id",
        },
        pacienteId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "paciente_id",
        },
        fechaRecepcion: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: "fecha_recepcion",
        },
        tipoMuestra: {
          type: DataTypes.STRING,
          allowNull: false,
          field: "tipo_muestra",
        },
        estado: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "pendiente",
        },
      },
      {
        sequelize,
        modelName: "Muestra",
        tableName: "muestras",
        timestamps: false,
      }
    );
    return Muestra;
  }

  static associate(models) {
    Muestra.belongsTo(models.OrdenExamen, {
      foreignKey: "ordenExamenId",
      as: "ordenExamen",
    });
    Muestra.belongsTo(models.Paciente, {
      foreignKey: "pacienteId",
      as: "paciente",
    });
    Muestra.hasMany(models.Resultado, {
      foreignKey: "muestraId",
      as: "resultados",
    });
  }
}

module.exports = Muestra;

