const { DataTypes, Model } = require("sequelize");

class Usuario extends Model {
  static initModel(sequelize) {
    Usuario.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        nombreUsuario: {
          type: DataTypes.STRING,
          field: "nombre_usuario",
        },
        rol: {
          type: DataTypes.ENUM("administrativo", "recepcionista", "técnico", "bioquímico", "paciente"),
          allowNull: false,
          field: "rol",
        },
        correo: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          field: "correo",
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        estado: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: "Usuario",
        tableName: "usuarios",
        timestamps: false,
      }
    );
    return Usuario;
  }

  static associate(models) {
    Usuario.hasMany(models.Paciente, { foreignKey: 'usuarioId', as: 'pacientes' });
    Usuario.hasMany(models.Auditoria, { foreignKey: 'usuarioId', as: 'auditorias' });
    Usuario.hasMany(models.HistorialEstadosOrden, {
      foreignKey: 'usuarioId',
      as: 'historialEstadosOrden',
    });
  }
}

module.exports = Usuario;

