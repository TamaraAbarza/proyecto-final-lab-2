"use strict";

var ordenTrabajoService = require("../services/ordenTrabajoService");

var pacienteService = require("../services/pacienteService");

var examenService = require("../services/examenService");

var OrdenTrabajo = require("../models/ordenTrabajo");

var OrdenExamen = require("../models/ordenExamen");

var Muestra = require("../models/muestra"); //vista de creación de orden


var getCrearOrden = function getCrearOrden(req, res) {
  var pacienteId, examenes;
  return regeneratorRuntime.async(function getCrearOrden$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          pacienteId = req.params.pacienteId;

          if (pacienteId) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).send("El ID del paciente es requerido"));

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(examenService.getAllExamenes());

        case 6:
          examenes = _context.sent;
          res.render("orden/formOrden", {
            pacienteId: pacienteId,
            examenes: examenes
          });
          _context.next = 14;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          res.status(500).send("Error al obtener los exámenes");

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
};
/*
const crearOrden = async (req, res) => {
  try {
    let {
      pacienteId,
      diagnostico,
      fechaCreacion,
      observaciones,
      examenesSeleccionados: rawExamenes,
      muestraTraida: rawMuestras
    } = req.body;

    // Asegurarnos de que rawExamenes sea array
    if (!Array.isArray(rawExamenes)) {
      rawExamenes = rawExamenes ? [rawExamenes] : [];
    }

    // Asegurarnos de que rawMuestras sea array
    if (!rawMuestras) {
      rawMuestras = [];
    } else if (!Array.isArray(rawMuestras)) {
      rawMuestras = [rawMuestras];
    }

    // Construir el array con objetos { examenId, muestraTraida }
    const examenesProcesados = rawExamenes
      .map(idStr => {
        const examenId = parseInt(idStr, 10);
        if (isNaN(examenId)) return null;
        const muestraTraida = rawMuestras.includes(idStr);
        return { examenId, muestraTraida };
      })
      .filter(obj => obj !== null);

    // Validaciones
    if (
      !pacienteId ||
      !diagnostico ||
      !fechaCreacion ||
      examenesProcesados.length === 0
    ) {
      return res.status(400).send("Faltan datos obligatorios o no seleccionaste exámenes");
    }

    // Crear orden de trabajo
    const nuevaOrden = await OrdenTrabajo.create({
      pacienteId: parseInt(pacienteId, 10),
      diagnostico,
      fechaCreacion,
      fechaEntrega: fechaCreacion,
      observaciones,
      estado: "esperando toma de muestra"
    });

    let todasMuestrasTraidas = true;

    for (const { examenId, muestraTraida } of examenesProcesados) {
      const ordenExamen = await OrdenExamen.create({
        ordenId: nuevaOrden.id,
        examenId
      });

      if (muestraTraida) {
        const tipoMuestra = await examenService.getTipoMuestra(examenId);
        await Muestra.create({
          ordenExamenId: ordenExamen.id,
          pacienteId: parseInt(pacienteId, 10),
          tipoMuestra
        });
      } else {
        todasMuestrasTraidas = false;
      }
    }

    if (todasMuestrasTraidas) {
      nuevaOrden.estado = "analítica";
      await nuevaOrden.save();
    }

    res.redirect("/orden/all");
  } catch (error) {
    console.error("Error en crearOrden:", error);
    res.status(500).render("error", {
      message: "Hubo un error al crear la orden.",
      role: req.usuario?.rol,
      error: error.message
    });
  }
};
*/
// vista de formulario de actualizacion de orden


var getActualizarOrden = function getActualizarOrden(req, res) {
  var ordenId, orden, examenes;
  return regeneratorRuntime.async(function getActualizarOrden$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          ordenId = req.params.ordenId;
          _context2.next = 4;
          return regeneratorRuntime.awrap(ordenTrabajoService.getOrdenId(ordenId));

        case 4:
          orden = _context2.sent;

          if (orden) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", res.status(404).send("Orden no encontrada"));

        case 7:
          if (!(orden.estado !== "esperando toma de muestra")) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", res.status(400).send("No se puede editar esta orden en su estado actual"));

        case 9:
          _context2.next = 11;
          return regeneratorRuntime.awrap(examenService.getAllExamenes());

        case 11:
          examenes = _context2.sent;
          res.render("orden/formOrden", {
            titulo: "Editar Orden de Trabajo",
            isEditMode: true,
            //modo edición
            paciente: orden.paciente,
            orden: orden,
            examenes: examenes,
            role: req.usuario.rol
          });
          _context2.next = 19;
          break;

        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](0);
          console.error("Error getActualizarOrden:", _context2.t0);
          res.status(500).render("error", {
            role: req.usuario.rol,
            error: _context2.t0.message
          });

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 15]]);
}; //actualizar una orden de trabajo


var actualizarOrden = function actualizarOrden(req, res) {
  var ordenId, data, result, ordenDetalle;
  return regeneratorRuntime.async(function actualizarOrden$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          ordenId = req.params.ordenId;
          data = req.body; // { pacienteId, diagnostico, examenes, tomaMuestra, observaciones }

          _context3.next = 5;
          return regeneratorRuntime.awrap(ordenTrabajoService.actualizarOrdenTrabajo(ordenId, data, req.usuario.id));

        case 5:
          result = _context3.sent;

          if (!(data.tomaMuestra === "trajo")) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", res.redirect("/muestra/".concat(ordenId, "/crear")));

        case 8:
          _context3.next = 10;
          return regeneratorRuntime.awrap(ordenTrabajoService.getOrdenId(ordenId));

        case 10:
          ordenDetalle = _context3.sent;
          res.render("orden/confirmacionOrden", {
            orden: ordenDetalle,
            tipoRegistro: "edicion",
            role: req.usuario.rol
          });
          _context3.next = 18;
          break;

        case 14:
          _context3.prev = 14;
          _context3.t0 = _context3["catch"](0);
          console.error("Error actualizarOrden:", _context3.t0);
          res.status(500).render("error", {
            message: "Hubo un error al actualizar la orden.",
            role: req.usuario.rol,
            error: _context3.t0.message
          });

        case 18:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 14]]);
}; // eliminar una orden de trabajo


var eliminarOrden = function eliminarOrden(req, res) {
  var ordenId, result;
  return regeneratorRuntime.async(function eliminarOrden$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          ordenId = req.params.ordenId;
          _context4.next = 4;
          return regeneratorRuntime.awrap(ordenTrabajoService.eliminarOrdenTrabajo(ordenId, req.usuario.id));

        case 4:
          result = _context4.sent;

          if (result) {
            res.redirect("/orden/all");
          } else {
            res.status(404).send("Orden no encontrada");
          }

          _context4.next = 12;
          break;

        case 8:
          _context4.prev = 8;
          _context4.t0 = _context4["catch"](0);
          console.error("Error eliminarOrden:", _context4.t0);
          res.status(500).render("error", {
            message: "Hubo un error al eliminar la orden.",
            role: req.usuario.rol,
            error: _context4.t0.message
          });

        case 12:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 8]]);
}; // Obtener los detalles de una orden de trabajo ---- sin uso aun


var getOrdenDetalle = function getOrdenDetalle(req, res) {
  var ordenId, orden;
  return regeneratorRuntime.async(function getOrdenDetalle$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          ordenId = req.params.ordenId;
          _context5.next = 4;
          return regeneratorRuntime.awrap(ordenTrabajoService.getOrdenId(ordenId));

        case 4:
          orden = _context5.sent;

          if (orden) {
            _context5.next = 7;
            break;
          }

          return _context5.abrupt("return", res.status(404).send("Orden no encontrada"));

        case 7:
          res.render("orden/ordenDetalle", {
            orden: orden,
            role: req.usuario.rol
          });
          _context5.next = 14;
          break;

        case 10:
          _context5.prev = 10;
          _context5.t0 = _context5["catch"](0);
          console.error("Error al renderizar vista getOrdenDetalle: ", _context5.t0);
          res.status(500).render("error", {
            message: "Hubo un error al obtener los detalles de la orden.",
            role: req.usuario.rol,
            error: _context5.t0.message
          });

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 10]]);
}; // Obtener las ordenes pendientes de registrar muestras (estado "esperando toma de muestra")


var getOrdenesPendientes = function getOrdenesPendientes(req, res) {
  var ordenesPendientes, ordenesConMuestra;
  return regeneratorRuntime.async(function getOrdenesPendientes$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(ordenTrabajoService.getAllOrdenes({
            estado: "esperando toma de muestra"
          }));

        case 3:
          ordenesPendientes = _context6.sent;
          _context6.next = 6;
          return regeneratorRuntime.awrap(ordenTrabajoService.getAllOrdenes({
            estado: "analitica"
          }));

        case 6:
          ordenesConMuestra = _context6.sent;
          res.render("orden/ordenesPendientes", {
            orders: ordenesPendientes,
            ordersWithSamples: ordenesConMuestra,
            role: req.usuario.rol
          });
          _context6.next = 14;
          break;

        case 10:
          _context6.prev = 10;
          _context6.t0 = _context6["catch"](0);
          console.error("Error al obtener ordenes pendientes: ", _context6.t0);
          res.status(500).render("error", {
            message: "Hubo un error al obtener las ordenes pendientes.",
            role: req.usuario.rol,
            error: _context6.t0.message
          });

        case 14:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 10]]);
}; //lista todas las ordenes de trabajo:


var getAllOrdenes = function getAllOrdenes(req, res) {
  var ordenes;
  return regeneratorRuntime.async(function getAllOrdenes$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(ordenTrabajoService.getAllOrdenes());

        case 3:
          ordenes = _context7.sent;
          res.render("orden/listaOrden", {
            ordenes: ordenes,
            role: req.usuario.rol
          });
          _context7.next = 11;
          break;

        case 7:
          _context7.prev = 7;
          _context7.t0 = _context7["catch"](0);
          console.error("Error al obtener ordenes: ", _context7.t0);
          res.status(500).render("error", {
            message: "Hubo un error al obtener las ordenes.",
            role: req.usuario.rol,
            error: _context7.t0.message
          });

        case 11:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 7]]);
}; // Obtener el historial de estados de una orden


var getHistorialEstados = function getHistorialEstados(req, res) {
  var historial;
  return regeneratorRuntime.async(function getHistorialEstados$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap(ordenTrabajoService.getHistorialEstados());

        case 3:
          historial = _context8.sent;
          console.log("Lo que devuelve el historial: " + historial);
          res.render("orden/historialOrden", {
            historial: historial || [],
            role: req.usuario.rol
          });
          _context8.next = 12;
          break;

        case 8:
          _context8.prev = 8;
          _context8.t0 = _context8["catch"](0);
          console.error("Error al obtener historial de estados: ", _context8.t0);
          res.status(500).render("error", {
            message: "Hubo un error al obtener el historial de estados.",
            role: req.usuario.rol,
            error: _context8.t0.message
          });

        case 12:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 8]]);
};

module.exports = {
  crearOrden: crearOrden,
  getCrearOrden: getCrearOrden,
  getOrdenDetalle: getOrdenDetalle,
  getOrdenesPendientes: getOrdenesPendientes,
  getHistorialEstados: getHistorialEstados,
  getActualizarOrden: getActualizarOrden,
  actualizarOrden: actualizarOrden,
  eliminarOrden: eliminarOrden,
  getAllOrdenes: getAllOrdenes
};