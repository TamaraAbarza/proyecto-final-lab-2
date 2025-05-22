const { DataTypes, Model } = require("sequelize");

class Paciente extends Model {
  static initModel(sequelize) {
    Paciente.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING, allowNull: false },
        apellido: { type: DataTypes.STRING, allowNull: false },
        dni: { type: DataTypes.STRING, allowNull: false },
        telefono: { type: DataTypes.STRING },
        direccion: { type: DataTypes.STRING },
        fechaNacimiento: { type: DataTypes.DATE, allowNull: false, field: "fecha_nacimiento" },
        genero: { type: DataTypes.ENUM('F', 'M'), allowNull: false },
        embarazo: { type: DataTypes.TINYINT, allowNull: false },
        fechaRegistro: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
          field: "fecha_registro",
        },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: "usuario_id" },
      },
      {
        sequelize,
        modelName: "Paciente",
        tableName: "pacientes",
        timestamps: false,
      }
    );
    return Paciente;
  }

  static associate(models) {
    Paciente.belongsTo(models.Usuario, { foreignKey: "usuarioId", as: "usuario" });
    Paciente.hasMany(models.OrdenTrabajo, { foreignKey: 'pacienteId', as: 'ordenesTrabajo' });
  }
}

module.exports = Paciente;
