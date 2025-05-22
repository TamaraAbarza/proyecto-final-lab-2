"use strict";

var _require = require("../models"),
    Muestra = _require.Muestra,
    OrdenExamen = _require.OrdenExamen,
    OrdenTrabajo = _require.OrdenTrabajo,
    Paciente = _require.Paciente,
    sequelize = _require.sequelize;

var historialService = require("../services/historialService");

var crearMuestra = function crearMuestra(_ref) {
  var ordenExamenId, pacienteId, fechaRecepcion, tipoMuestra, ordenId, usuarioId, transaction, ordenExamen, examenesPendientes, quedanPendientes;
  return regeneratorRuntime.async(function crearMuestra$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          ordenExamenId = _ref.ordenExamenId, pacienteId = _ref.pacienteId, fechaRecepcion = _ref.fechaRecepcion, tipoMuestra = _ref.tipoMuestra, ordenId = _ref.ordenId, usuarioId = _ref.usuarioId;
          _context.next = 3;
          return regeneratorRuntime.awrap(sequelize.transaction());

        case 3:
          transaction = _context.sent;
          _context.prev = 4;
          _context.next = 7;
          return regeneratorRuntime.awrap(OrdenExamen.findByPk(ordenExamenId, {
            include: {
              model: Muestra,
              as: "muestra"
            },
            transaction: transaction
          }));

        case 7:
          ordenExamen = _context.sent;

          if (ordenExamen) {
            _context.next = 10;
            break;
          }

          throw new Error("Orden de examen no encontrada.");

        case 10:
          if (!ordenExamen.muestra) {
            _context.next = 12;
            break;
          }

          throw new Error("Este examen ya tiene una muestra registrada.");

        case 12:
          _context.next = 14;
          return regeneratorRuntime.awrap(Muestra.create({
            ordenExamenId: ordenExamenId,
            pacienteId: pacienteId,
            fechaRecepcion: fechaRecepcion,
            tipoMuestra: tipoMuestra
          }, {
            transaction: transaction
          }));

        case 14:
          _context.next = 16;
          return regeneratorRuntime.awrap(OrdenExamen.findAll({
            where: {
              ordenId: ordenId
            },
            include: {
              model: Muestra,
              as: 'muestra',
              required: false
            },
            transaction: transaction
          }));

        case 16:
          examenesPendientes = _context.sent;
          quedanPendientes = examenesPendientes.some(function (oe) {
            return oe.muestra === null;
          }); // Si no quedan pendientes, actualizar estado y registrar historial

          if (quedanPendientes) {
            _context.next = 23;
            break;
          }

          _context.next = 21;
          return regeneratorRuntime.awrap(OrdenTrabajo.update({
            estado: 'analítica'
          }, {
            where: {
              id: ordenId
            },
            transaction: transaction
          }));

        case 21:
          _context.next = 23;
          return regeneratorRuntime.awrap(historialService.crear({
            ordenId: ordenId,
            estadoNuevo: 'analítica',
            descripcion: 'Todos los exámenes tienen muestra registrada. Estado cambiado a "analítica".',
            usuarioId: usuarioId
          }, transaction));

        case 23:
          _context.next = 25;
          return regeneratorRuntime.awrap(transaction.commit());

        case 25:
          _context.next = 33;
          break;

        case 27:
          _context.prev = 27;
          _context.t0 = _context["catch"](4);
          _context.next = 31;
          return regeneratorRuntime.awrap(transaction.rollback());

        case 31:
          console.error("Error en crearMuestraService:", _context.t0.message);
          throw _context.t0;

        case 33:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[4, 27]]);
};

var getMuestraId = function getMuestraId(id) {
  var muestra;
  return regeneratorRuntime.async(function getMuestraId$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Muestra.findByPk(id, {
            include: [{
              model: OrdenTrabajo,
              as: "ordenTrabajo"
            }, {
              model: Paciente,
              as: "paciente"
            }, {
              model: Resultado,
              as: "resultados"
            }]
          }));

        case 3:
          muestra = _context2.sent;
          return _context2.abrupt("return", muestra);

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.error("Error al obtener la muestra con ID ".concat(id, ":"), _context2.t0);
          throw _context2.t0;

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

var getAllMuestras = function getAllMuestras() {
  var filtros,
      muestras,
      _args3 = arguments;
  return regeneratorRuntime.async(function getAllMuestras$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          filtros = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {};
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(Muestra.findAll({
            where: filtros,
            include: [{
              model: OrdenTrabajo,
              as: "ordenTrabajo"
            }, {
              model: Paciente,
              as: "paciente"
            }, {
              model: Resultado,
              as: "resultados"
            }]
          }));

        case 4:
          muestras = _context3.sent;
          return _context3.abrupt("return", muestras);

        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](1);
          console.error("Error al obtener todas las muestras:", _context3.t0);
          throw _context3.t0;

        case 12:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 8]]);
};

var actualizarMuestra = function actualizarMuestra(id, datos) {
  var muestra;
  return regeneratorRuntime.async(function actualizarMuestra$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(Muestra.findByPk(id));

        case 3:
          muestra = _context4.sent;

          if (muestra) {
            _context4.next = 6;
            break;
          }

          throw new Error("Muestra con ID ".concat(id, " no encontrada."));

        case 6:
          _context4.next = 8;
          return regeneratorRuntime.awrap(muestra.update(datos));

        case 8:
          return _context4.abrupt("return", muestra);

        case 11:
          _context4.prev = 11;
          _context4.t0 = _context4["catch"](0);
          console.error("Error al actualizar la muestra con ID ".concat(id, ":"), _context4.t0);
          throw _context4.t0;

        case 15:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

var eliminarMuestra = function eliminarMuestra(id) {
  var muestra;
  return regeneratorRuntime.async(function eliminarMuestra$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(Muestra.findByPk(id));

        case 3:
          muestra = _context5.sent;

          if (muestra) {
            _context5.next = 6;
            break;
          }

          throw new Error("Muestra con ID ".concat(id, " no encontrada."));

        case 6:
          _context5.next = 8;
          return regeneratorRuntime.awrap(muestra.update({
            estado: "eliminada"
          }));

        case 8:
          return _context5.abrupt("return", true);

        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5["catch"](0);
          console.error("Error al eliminar la muestra con ID ".concat(id, ":"), _context5.t0);
          throw _context5.t0;

        case 15:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

module.exports = {
  crearMuestra: crearMuestra,
  getMuestraId: getMuestraId,
  getAllMuestras: getAllMuestras,
  actualizarMuestra: actualizarMuestra,
  eliminarMuestra: eliminarMuestra
};