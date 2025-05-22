"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _require = require("sequelize"),
    DataTypes = _require.DataTypes,
    Model = _require.Model;

var OrdenTrabajo =
/*#__PURE__*/
function (_Model) {
  _inherits(OrdenTrabajo, _Model);

  function OrdenTrabajo() {
    _classCallCheck(this, OrdenTrabajo);

    return _possibleConstructorReturn(this, _getPrototypeOf(OrdenTrabajo).apply(this, arguments));
  }

  _createClass(OrdenTrabajo, null, [{
    key: "initModel",
    value: function initModel(sequelize) {
      OrdenTrabajo.init({
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        pacienteId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "paciente_id"
        },
        diagnostico: {
          type: DataTypes.TEXT,
          allowNull: false,
          field: "diagnostico"
        },
        fechaCreacion: {
          type: DataTypes.DATE,
          field: "fecha_creacion"
        },
        fechaEntrega: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "fecha_entrega"
        },
        estado: {
          type: DataTypes.ENUM("esperando toma de muestra", "analítica", "pre informe", "para validar", "informada"),
          defaultValue: "esperando toma de muestra",
          field: "estado"
        },
        observaciones: {
          type: DataTypes.TEXT,
          field: 'observaciones'
        }
      }, {
        sequelize: sequelize,
        modelName: "OrdenTrabajo",
        tableName: "ordenes_trabajo",
        timestamps: false
      });
      return OrdenTrabajo;
    }
  }, {
    key: "associate",
    value: function associate(models) {
      OrdenTrabajo.hasMany(models.OrdenExamen, {
        foreignKey: "ordenId",
        as: "ordenesExamenes"
      });
      OrdenTrabajo.belongsTo(models.Paciente, {
        foreignKey: "pacienteId",
        as: "paciente"
      });
      OrdenTrabajo.hasMany(models.Resultado, {
        foreignKey: "ordenId",
        as: "resultados"
      });
      OrdenTrabajo.hasMany(models.HistorialEstadosOrden, {
        foreignKey: "ordenId",
        as: "historialEstadosOrden"
      });
    }
  }]);

  return OrdenTrabajo;
}(Model);

module.exports = OrdenTrabajo;