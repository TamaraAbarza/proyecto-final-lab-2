"use strict";

// services/examenService.js
var _require = require("../models"),
    Examen = _require.Examen,
    sequelize = _require.sequelize;

var crearExamen = function crearExamen(datos) {
  var nuevoExamen;
  return regeneratorRuntime.async(function crearExamen$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Examen.create(datos));

        case 3:
          nuevoExamen = _context.sent;
          return _context.abrupt("return", nuevoExamen);

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.error("Error al crear el examen:", _context.t0);
          throw _context.t0;

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

var getExamenId = function getExamenId(id) {
  var examen;
  return regeneratorRuntime.async(function getExamenId$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Examen.findByPk(id));

        case 3:
          examen = _context2.sent;
          return _context2.abrupt("return", examen);

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.error("Error al obtener el examen con ID ".concat(id, ":"), _context2.t0);
          throw _context2.t0;

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

var getTipoMuestra = function getTipoMuestra(id) {
  var examen;
  return regeneratorRuntime.async(function getTipoMuestra$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(Examen.findByPk(id));

        case 3:
          examen = _context3.sent;

          if (!examen) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", examen.tipoMuestra);

        case 6:
          return _context3.abrupt("return", null);

        case 9:
          _context3.prev = 9;
          _context3.t0 = _context3["catch"](0);
          console.error("Error al obtener el tipo de muestra: ", _context3.t0);
          throw _context3.t0;

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 9]]);
};

var getAllExamenes = function getAllExamenes() {
  var filtros,
      examenes,
      _args4 = arguments;
  return regeneratorRuntime.async(function getAllExamenes$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          filtros = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : {};
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(Examen.findAll({
            where: filtros
          }));

        case 4:
          examenes = _context4.sent;
          return _context4.abrupt("return", examenes);

        case 8:
          _context4.prev = 8;
          _context4.t0 = _context4["catch"](1);
          console.error("Error al obtener todos los exámenes:", _context4.t0);
          throw _context4.t0;

        case 12:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 8]]);
};

var actualizarExamen = function actualizarExamen(id, datos) {
  var examen;
  return regeneratorRuntime.async(function actualizarExamen$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(Examen.findByPk(id));

        case 3:
          examen = _context5.sent;

          if (examen) {
            _context5.next = 6;
            break;
          }

          throw new Error("Examen con ID ".concat(id, " no encontrado."));

        case 6:
          _context5.next = 8;
          return regeneratorRuntime.awrap(examen.update(datos));

        case 8:
          return _context5.abrupt("return", examen);

        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5["catch"](0);
          console.error("Error al actualizar el examen con ID ".concat(id, ":"), _context5.t0);
          throw _context5.t0;

        case 15:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

var eliminarExamen = function eliminarExamen(id) {
  var examen;
  return regeneratorRuntime.async(function eliminarExamen$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(Examen.findByPk(id));

        case 3:
          examen = _context6.sent;

          if (examen) {
            _context6.next = 6;
            break;
          }

          throw new Error("Examen no encontrado.");

        case 6:
          _context6.next = 8;
          return regeneratorRuntime.awrap(examen.update({
            estado: false
          }));

        case 8:
          return _context6.abrupt("return", true);

        case 11:
          _context6.prev = 11;
          _context6.t0 = _context6["catch"](0);
          console.error("Error al eliminar el examen: ", _context6.t0);
          throw _context6.t0;

        case 15:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

module.exports = {
  crearExamen: crearExamen,
  getExamenId: getExamenId,
  getAllExamenes: getAllExamenes,
  actualizarExamen: actualizarExamen,
  eliminarExamen: eliminarExamen,
  getTipoMuestra: getTipoMuestra
};