"use strict";

// controllers/muestraController.js
var muestraService = require("../services/muestraService");

ordenTrabajoService = require("../services/ordenTrabajoService");

var getCrearMuestra = function getCrearMuestra(req, res) {
  var ordenId, orden;
  return regeneratorRuntime.async(function getCrearMuestra$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          ordenId = req.params.ordenId;
          _context.next = 4;
          return regeneratorRuntime.awrap(ordenTrabajoService.getOrdenId(ordenId));

        case 4:
          orden = _context.sent;
          res.render("muestra/formMuestra", {
            orden: orden
          });
          _context.next = 12;
          break;

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          console.error("Error en getCrearMuestra:", _context.t0.message);
          res.status(500).send("Error al cargar el formulario de muestra");

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 8]]);
};

var crearMuestra = function crearMuestra(req, res) {
  var _req$body, examenId, pacienteId, fechaRecepcion, tipoMuestra, ordenId;

  return regeneratorRuntime.async(function crearMuestra$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body = req.body, examenId = _req$body.examenId, pacienteId = _req$body.pacienteId, fechaRecepcion = _req$body.fechaRecepcion, tipoMuestra = _req$body.tipoMuestra;
          ordenId = req.params.ordenId;
          _context2.next = 5;
          return regeneratorRuntime.awrap(muestraService.crearMuestra({
            ordenExamenId: examenId,
            pacienteId: pacienteId,
            fechaRecepcion: fechaRecepcion,
            tipoMuestra: tipoMuestra,
            ordenId: ordenId,
            usuarioId: req.usuario.id
          }));

        case 5:
          res.redirect("/muestra/".concat(ordenId, "/crear"));
          _context2.next = 12;
          break;

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          console.error("Error en crearMuestra:", _context2.t0.message);
          res.status(500).send("Error al registrar la muestra");

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 8]]);
};

var generarEtiquetaPDF = function generarEtiquetaPDF(req, res, next) {
  var ordenId;
  return regeneratorRuntime.async(function generarEtiquetaPDF$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          ordenId = req.params.ordenId;
          _context3.next = 4;
          return regeneratorRuntime.awrap(muestraService.generarEtiquetaPDF(ordenId, res));

        case 4:
          _context3.next = 10;
          break;

        case 6:
          _context3.prev = 6;
          _context3.t0 = _context3["catch"](0);
          console.error("Error en generarEtiquetaPDF: ", _context3.t0);
          res.status(500).render("error", {
            message: "",
            role: req.usuario.rol,
            error: _context3.t0.message
          });

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 6]]);
};

module.exports = {
  getCrearMuestra: getCrearMuestra,
  crearMuestra: crearMuestra,
  generarEtiquetaPDF: generarEtiquetaPDF
};