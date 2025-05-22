"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// services/ordenTrabajoService.js
var _require = require("../models"),
    OrdenTrabajo = _require.OrdenTrabajo,
    Paciente = _require.Paciente,
    Examen = _require.Examen,
    OrdenExamen = _require.OrdenExamen,
    HistorialEstadosOrden = _require.HistorialEstadosOrden,
    Muestra = _require.Muestra,
    Resultado = _require.Resultado,
    Usuario = _require.Usuario,
    sequelize = _require.sequelize;

var historialService = require("../services/historialService");

var muestraService = require("../services/muestraService");

var _require2 = require("sequelize"),
    Op = _require2.Op;

var crearOrdenTrabajo = function crearOrdenTrabajo(_ref) {
  var pacienteId, diagnostico, fechaCreacion, examenIds, muestrasTraidas;
  return regeneratorRuntime.async(function crearOrdenTrabajo$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          pacienteId = _ref.pacienteId, diagnostico = _ref.diagnostico, fechaCreacion = _ref.fechaCreacion, examenIds = _ref.examenIds, muestrasTraidas = _ref.muestrasTraidas;
          _context2.next = 3;
          return regeneratorRuntime.awrap(sequelize.transaction(function _callee(t) {
            var allTrajo, estadoOrden, orden, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, examenId, ordenExamen, examen;

            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    // Determinar estado de la orden: analítica si todas las muestras fueron traídas
                    allTrajo = examenIds.every(function (id) {
                      return muestrasTraidas.includes(id);
                    });
                    estadoOrden = allTrajo ? 'analítica' : 'esperando toma de muestra'; // Crear la orden de trabajo

                    _context.next = 4;
                    return regeneratorRuntime.awrap(OrdenTrabajo.create({
                      pacienteId: pacienteId,
                      diagnostico: diagnostico,
                      fechaCreacion: fechaCreacion,
                      estado: estadoOrden
                    }, {
                      transaction: t
                    }));

                  case 4:
                    orden = _context.sent;
                    // Para cada examen, crear OrdenExamen, y si corresponde, Muestra
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context.prev = 8;
                    _iterator = examenIds[Symbol.iterator]();

                  case 10:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                      _context.next = 24;
                      break;
                    }

                    examenId = _step.value;
                    _context.next = 14;
                    return regeneratorRuntime.awrap(OrdenExamen.create({
                      ordenId: orden.id,
                      examenId: examenId
                    }, {
                      transaction: t
                    }));

                  case 14:
                    ordenExamen = _context.sent;

                    if (!muestrasTraidas.includes(examenId)) {
                      _context.next = 21;
                      break;
                    }

                    _context.next = 18;
                    return regeneratorRuntime.awrap(Examen.findByPk(examenId, {
                      transaction: t
                    }));

                  case 18:
                    examen = _context.sent;
                    _context.next = 21;
                    return regeneratorRuntime.awrap(Muestra.create({
                      ordenExamenId: ordenExamen.id,
                      pacienteId: pacienteId,
                      tipoMuestra: examen.tipoMuestra,
                      estado: 'pendiente'
                    }, {
                      transaction: t
                    }));

                  case 21:
                    _iteratorNormalCompletion = true;
                    _context.next = 10;
                    break;

                  case 24:
                    _context.next = 30;
                    break;

                  case 26:
                    _context.prev = 26;
                    _context.t0 = _context["catch"](8);
                    _didIteratorError = true;
                    _iteratorError = _context.t0;

                  case 30:
                    _context.prev = 30;
                    _context.prev = 31;

                    if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                      _iterator["return"]();
                    }

                  case 33:
                    _context.prev = 33;

                    if (!_didIteratorError) {
                      _context.next = 36;
                      break;
                    }

                    throw _iteratorError;

                  case 36:
                    return _context.finish(33);

                  case 37:
                    return _context.finish(30);

                  case 38:
                    return _context.abrupt("return", orden);

                  case 39:
                  case "end":
                    return _context.stop();
                }
              }
            }, null, null, [[8, 26, 30, 38], [31,, 33, 37]]);
          }));

        case 3:
          return _context2.abrupt("return", _context2.sent);

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
};

var getOrdenId = function getOrdenId(id) {
  var filtros,
      orden,
      _args3 = arguments;
  return regeneratorRuntime.async(function getOrdenId$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          filtros = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {};
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(OrdenTrabajo.findOne({
            where: _objectSpread({
              id: id
            }, filtros),
            include: [{
              model: Paciente,
              as: "paciente",
              include: [{
                model: Usuario,
                as: "usuario",
                attributes: ["correo"]
              }]
            }, {
              model: OrdenExamen,
              as: "ordenesExamenes",
              include: [{
                model: Examen,
                as: "examen"
              }, {
                model: Muestra,
                as: "muestra"
              }]
            }, {
              model: Resultado,
              as: "resultados"
            }, {
              model: HistorialEstadosOrden,
              as: "historialEstadosOrden"
            }]
          }));

        case 4:
          orden = _context3.sent;

          if (orden) {
            _context3.next = 7;
            break;
          }

          throw new Error("Orden no encontrada.");

        case 7:
          return _context3.abrupt("return", orden);

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](1);
          console.error("Error al obtener la orden:", _context3.t0.message);
          throw new Error("Error al obtener la orden con ID ".concat(id, ": ").concat(_context3.t0.message));

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 10]]);
};

var getHistorialEstados = function getHistorialEstados() {
  return regeneratorRuntime.async(function getHistorialEstados$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(HistorialEstadosOrden.findAll({
            include: [{
              model: OrdenTrabajo,
              as: "ordenTrabajo",
              include: [{
                model: Paciente,
                as: "paciente"
              }]
            }, {
              model: Usuario,
              as: "usuario"
            }],
            order: [["createdAt", "DESC"]]
          }));

        case 3:
          return _context4.abrupt("return", _context4.sent);

        case 6:
          _context4.prev = 6;
          _context4.t0 = _context4["catch"](0);
          console.error("Error al obtener el historial de estados:", _context4.t0.message);
          throw new Error("Error al obtener el historial de estados: ".concat(_context4.t0.message));

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 6]]);
};

var getAllOrdenes = function getAllOrdenes() {
  var filtros,
      _args5 = arguments;
  return regeneratorRuntime.async(function getAllOrdenes$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          filtros = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : {};
          _context5.prev = 1;
          return _context5.abrupt("return", OrdenTrabajo.findAll({
            where: filtros,
            include: [{
              model: Paciente,
              as: "paciente",
              include: [{
                model: Usuario,
                as: "usuario",
                attributes: ["correo"]
              }]
            }, {
              model: OrdenExamen,
              as: "ordenesExamenes",
              include: [{
                model: Examen,
                as: "examen"
              }, {
                model: Muestra,
                as: "muestra"
              }]
            }, {
              model: Resultado,
              as: "resultados"
            }],
            order: [["fecha_creacion", "DESC"]]
          }));

        case 5:
          _context5.prev = 5;
          _context5.t0 = _context5["catch"](1);
          console.error("Error al obtener todas las órdenes:", _context5.t0.message);
          throw new Error("Error al obtener las \xF3rdenes: ".concat(_context5.t0.message));

        case 9:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 5]]);
};

var actualizarOrdenTrabajo = function actualizarOrdenTrabajo(ordenId, data, userId) {
  var transaction, orden, estadoAnterior;
  return regeneratorRuntime.async(function actualizarOrdenTrabajo$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(sequelize.transaction());

        case 2:
          transaction = _context6.sent;
          _context6.prev = 3;
          _context6.next = 6;
          return regeneratorRuntime.awrap(OrdenTrabajo.findByPk(ordenId, {
            transaction: transaction
          }));

        case 6:
          orden = _context6.sent;

          if (orden) {
            _context6.next = 9;
            break;
          }

          throw new Error("Orden no encontrada.");

        case 9:
          if (!(orden.estado !== "esperando toma de muestra")) {
            _context6.next = 11;
            break;
          }

          throw new Error('Solo se puede editar en estado "esperando toma de muestra".');

        case 11:
          estadoAnterior = orden.estado; // Actualizar campos

          orden.diagnostico = data.diagnostico;
          orden.observaciones = data.observaciones;
          _context6.next = 16;
          return regeneratorRuntime.awrap(orden.save({
            transaction: transaction
          }));

        case 16:
          if (!(Array.isArray(data.examenes) && data.examenes.length > 0)) {
            _context6.next = 19;
            break;
          }

          _context6.next = 19;
          return regeneratorRuntime.awrap(asignarExamenesYMuestras({
            ordenId: orden.id,
            examenesIds: data.examenes,
            muestras: data.muestras,
            pacienteId: orden.pacienteId
          }, transaction));

        case 19:
          _context6.next = 21;
          return regeneratorRuntime.awrap(historialService.registrarCambio({
            ordenId: ordenId,
            estadoAnterior: estadoAnterior,
            estadoNuevo: orden.estado,
            observacion: "Orden modificada",
            usuarioId: userId
          }, transaction));

        case 21:
          _context6.next = 23;
          return regeneratorRuntime.awrap(transaction.commit());

        case 23:
          return _context6.abrupt("return", orden);

        case 26:
          _context6.prev = 26;
          _context6.t0 = _context6["catch"](3);
          _context6.next = 30;
          return regeneratorRuntime.awrap(transaction.rollback());

        case 30:
          console.error("Error al actualizar la orden de trabajo:", _context6.t0.message);
          throw new Error("Error al actualizar la orden de trabajo con ID ".concat(ordenId, ": ").concat(_context6.t0.message));

        case 32:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[3, 26]]);
};

var eliminarOrdenTrabajo = function eliminarOrdenTrabajo(ordenId) {
  var t, resultado;
  return regeneratorRuntime.async(function eliminarOrdenTrabajo$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(sequelize.transaction());

        case 2:
          t = _context7.sent;
          _context7.prev = 3;
          _context7.next = 6;
          return regeneratorRuntime.awrap(Muestra.destroy({
            where: {
              ordenExamenId: _defineProperty({}, Op["in"], sequelize.literal("(SELECT id FROM ordenes_examen WHERE orden_id = ".concat(ordenId, ")")))
            },
            transaction: t
          }));

        case 6:
          _context7.next = 8;
          return regeneratorRuntime.awrap(OrdenExamen.destroy({
            where: {
              ordenId: ordenId
            },
            transaction: t
          }));

        case 8:
          _context7.next = 10;
          return regeneratorRuntime.awrap(Resultado.destroy({
            where: {
              ordenId: ordenId
            },
            transaction: t
          }));

        case 10:
          _context7.next = 12;
          return regeneratorRuntime.awrap(HistorialEstadosOrden.destroy({
            where: {
              ordenId: ordenId
            },
            transaction: t
          }));

        case 12:
          _context7.next = 14;
          return regeneratorRuntime.awrap(OrdenTrabajo.destroy({
            where: {
              id: ordenId
            },
            transaction: t
          }));

        case 14:
          resultado = _context7.sent;
          _context7.next = 17;
          return regeneratorRuntime.awrap(t.commit());

        case 17:
          return _context7.abrupt("return", resultado === 1);

        case 20:
          _context7.prev = 20;
          _context7.t0 = _context7["catch"](3);
          _context7.next = 24;
          return regeneratorRuntime.awrap(t.rollback());

        case 24:
          console.error("Error al eliminar orden de trabajo:", _context7.t0);
          throw new Error("Error al eliminar la orden y sus relaciones.");

        case 26:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[3, 20]]);
};

var asignarExamenesYMuestras = function asignarExamenesYMuestras(_ref2, transaction) {
  var ordenId, examenesIds, muestras, pacienteId, ordenesExamenAnteriores, ordenesExamenIds, examenes, nuevosOrdenesExamen, muestrasAInsertar, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _loop, _iterator2, _step2;

  return regeneratorRuntime.async(function asignarExamenesYMuestras$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          ordenId = _ref2.ordenId, examenesIds = _ref2.examenesIds, muestras = _ref2.muestras, pacienteId = _ref2.pacienteId;
          _context8.next = 3;
          return regeneratorRuntime.awrap(OrdenExamen.findAll({
            where: {
              ordenId: ordenId
            },
            transaction: transaction
          }));

        case 3:
          ordenesExamenAnteriores = _context8.sent;
          ordenesExamenIds = ordenesExamenAnteriores.map(function (oe) {
            return oe.id;
          });

          if (!(ordenesExamenIds.length > 0)) {
            _context8.next = 8;
            break;
          }

          _context8.next = 8;
          return regeneratorRuntime.awrap(Muestra.destroy({
            where: {
              ordenExamenId: ordenesExamenIds
            },
            transaction: transaction
          }));

        case 8:
          _context8.next = 10;
          return regeneratorRuntime.awrap(OrdenExamen.destroy({
            where: {
              ordenId: ordenId
            },
            transaction: transaction
          }));

        case 10:
          _context8.next = 12;
          return regeneratorRuntime.awrap(Examen.findAll({
            where: {
              id: examenesIds
            },
            transaction: transaction
          }));

        case 12:
          examenes = _context8.sent;
          _context8.next = 15;
          return regeneratorRuntime.awrap(OrdenExamen.bulkCreate(examenes.map(function (ex) {
            return {
              ordenId: ordenId,
              examenId: ex.id,
              fechaProgramadaResultados: new Date(Date.now() + ex.diasEntrega * 86400000),
              estadoExamen: "pendiente"
            };
          }), {
            transaction: transaction,
            returning: true
          }));

        case 15:
          nuevosOrdenesExamen = _context8.sent;

          if (!(muestras && _typeof(muestras) === "object")) {
            _context8.next = 41;
            break;
          }

          muestrasAInsertar = [];
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context8.prev = 21;

          _loop = function _loop() {
            var ordenExamen = _step2.value;
            var examen = examenes.find(function (e) {
              return e.id === ordenExamen.examenId;
            });
            var tipo = examen.tipoMuestra;
            var valorMuestra = muestras[tipo];

            if (valorMuestra === "analítica") {
              muestrasAInsertar.push({
                ordenExamenId: ordenExamen.id,
                pacienteId: pacienteId,
                tipoMuestra: tipo,
                fechaRecepcion: new Date()
              });
            }
          };

          for (_iterator2 = nuevosOrdenesExamen[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            _loop();
          }

          _context8.next = 30;
          break;

        case 26:
          _context8.prev = 26;
          _context8.t0 = _context8["catch"](21);
          _didIteratorError2 = true;
          _iteratorError2 = _context8.t0;

        case 30:
          _context8.prev = 30;
          _context8.prev = 31;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 33:
          _context8.prev = 33;

          if (!_didIteratorError2) {
            _context8.next = 36;
            break;
          }

          throw _iteratorError2;

        case 36:
          return _context8.finish(33);

        case 37:
          return _context8.finish(30);

        case 38:
          if (!(muestrasAInsertar.length > 0)) {
            _context8.next = 41;
            break;
          }

          _context8.next = 41;
          return regeneratorRuntime.awrap(Muestra.bulkCreate(muestrasAInsertar, {
            transaction: transaction
          }));

        case 41:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[21, 26, 30, 38], [31,, 33, 37]]);
};

module.exports = {
  crearOrdenTrabajo: crearOrdenTrabajo,
  getOrdenId: getOrdenId,
  getHistorialEstados: getHistorialEstados,
  getAllOrdenes: getAllOrdenes,
  actualizarOrdenTrabajo: actualizarOrdenTrabajo,
  eliminarOrdenTrabajo: eliminarOrdenTrabajo
};