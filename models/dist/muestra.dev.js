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

var Muestra =
/*#__PURE__*/
function (_Model) {
  _inherits(Muestra, _Model);

  function Muestra() {
    _classCallCheck(this, Muestra);

    return _possibleConstructorReturn(this, _getPrototypeOf(Muestra).apply(this, arguments));
  }

  _createClass(Muestra, null, [{
    key: "initModel",
    value: function initModel(sequelize) {
      Muestra.init({
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        ordenExamenId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "orden_examen_id"
        },
        pacienteId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "paciente_id"
        },
        fechaRecepcion: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: "fecha_recepcion"
        },
        tipoMuestra: {
          type: DataTypes.STRING,
          allowNull: false,
          field: "tipo_muestra"
        },
        estado: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "pendiente"
        }
      }, {
        sequelize: sequelize,
        modelName: "Muestra",
        tableName: "muestras",
        timestamps: false
      });
      return Muestra;
    }
  }, {
    key: "associate",
    value: function associate(models) {
      Muestra.belongsTo(models.OrdenExamen, {
        foreignKey: "ordenExamenId",
        as: "ordenExamen"
      });
      Muestra.belongsTo(models.Paciente, {
        foreignKey: "pacienteId",
        as: "paciente"
      });
      Muestra.hasMany(models.Resultado, {
        foreignKey: "muestraId",
        as: "resultados"
      });
    }
  }]);

  return Muestra;
}(Model);

module.exports = Muestra;