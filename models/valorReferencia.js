const { DataTypes, Model } = require("sequelize");

class ValorReferencia extends Model {
  static initModel(sequelize) {
    ValorReferencia.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        determinacionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "determinacion_id",
        },
        edadMinima: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "edad_minima",
        },
        edadMaxima: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "edad_maxima",
        },
        genero: {
          type: DataTypes.ENUM("F", "M"),
          allowNull: true,
          field: "genero",
        },
        valorReferenciaMinimo: {
          type: DataTypes.FLOAT,
          allowNull: false,
          field: "valor_referencia_minimo",
        },
        valorReferenciaMaximo: {
          type: DataTypes.FLOAT,
          allowNull: false,
          field: "valor_referencia_maximo",
        },
        estado: { type: DataTypes.BOOLEAN, field: "estado" },
      },
      {
        sequelize,
        modelName: "ValorReferencia",
        tableName: "valores_referencia",
        timestamps: false,
      }
    );
    return ValorReferencia;
  }

  static associate(models) {
    ValorReferencia.belongsTo(models.Determinacion, {
      foreignKey: "determinacionId",
      as: "determinacion",
    });
  }
}

module.exports = ValorReferencia;
