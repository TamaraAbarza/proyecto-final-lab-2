const { DataTypes, Model } = require('sequelize');

class Auditoria extends Model {
  static initModel(sequelize) {
    Auditoria.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        tablaAfectada: {
          type: DataTypes.STRING,
          allowNull: false,
          field: 'tabla_afectada'
        },
        registroId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'registro_id'
        },
        operacion: {
          type: DataTypes.ENUM("inserción", "actualización", "eliminación", "otro"),
          allowNull: false,
          field: 'operacion'
        },
        detalles: {
          type: DataTypes.TEXT,
          field: 'detalles'
        },
        usuarioId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'usuario_id'
        }
      },
      {
        sequelize,
        modelName: 'Auditoria',
        tableName: 'auditorias',
        timestamps: true
      }
    );
    return Auditoria;
  }

  static associate(models) {
    Auditoria.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario'
    });
  }
}

module.exports = Auditoria;

