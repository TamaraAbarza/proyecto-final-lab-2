// controllers/muestraController.js
const muestraService = require("../services/muestraService");
const ordenTrabajoService = require("../services/ordenTrabajoService");
const historialService = require("../services/historialService");
const auditoriaService = require("../services/auditoriaService");

const { OrdenTrabajo, OrdenExamen, Muestra } = require("../models");

const getCrearMuestra = async (req, res) => {
  try {
    const ordenId = req.params.ordenId;
    const orden = await ordenTrabajoService.getOrdenId(ordenId);

    res.render("muestra/formMuestra", { orden, role: req.usuario.rol });
  } catch (error) {
    console.error("Error en getCrearMuestra:", error.message);
    res.status(500).render("error", {
      message: "Hubo un error al crear la muestra.",
      role: req.usuario?.rol,
      error: error.message
    });
  }
};

const crearMuestra = async (req, res) => {
  try {
    const { examenId, pacienteId, fechaRecepcion, tipoMuestra } = req.body;
    const { ordenId } = req.params;

    // Crear la muestra en la base de datos
    const muestra = await muestraService.crearMuestra({
      ordenExamenId: examenId,
      pacienteId,
      fechaRecepcion,
      tipoMuestra,
      ordenId,
      usuarioId: req.usuario.id
    });

    //registro auditoria
    await auditoriaService.crearAuditoria({
      tablaAfectada: "Muestra",
      registroId: ordenId,
      operacion: "inserción",
      detalles: "Se descargó la etiqueta de la muestra",
      usuarioId: req.usuario.id
    });

    // Obtener la orden y paciente para generar la etiqueta
    const orden = await ordenTrabajoService.getOrdenId(ordenId);
    const paciente = orden.paciente;

    // Generar la etiqueta en formato PDF
    const etiquetaPath = await muestraService.generarEtiqueta(
      ordenId,
      paciente,
      fechaRecepcion
    );

    // Enviar la etiqueta PDF al navegador para su descarga
    res.download(etiquetaPath, `etiqueta_orden_${ordenId}.pdf`, (err) => {
      if (err) {
        console.error("Error al enviar el archivo PDF:", err);
        res.status(500).send("Error al descargar la etiqueta.");
      }
    });
  } catch (error) {
    console.error("Error en crearMuestra:", error.message);
    res.status(500).render("error", {
      message: "Hubo un error al crear la muestra.",
      role: req.usuario?.rol,
      error: error.message
    });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const muestraId = req.params.id;

    const muestra = await muestraService.getMuestraId(muestraId);
    if (!muestra) {
      return res.status(404).send("Muestra no encontrada");
    }

    await muestraService.cambiarEstado(muestraId, "procesada", usuarioId);

     await auditoriaService.crearAuditoria({
      tablaAfectada: "Muestra",
      registroId: muestraId,
      operacion: "otro",
      detalles: "Se cambió el estado de la muestra a procesada",
      usuarioId: req.usuario.id
    });

    const ordenTrabajo = muestra.ordenExamen.ordenTrabajo;
    if (ordenTrabajo.estado !== "analítica") {
      return res.redirect("/orden/pendientes/muestras"); // no se modifica porque faltan muestras para registrar
    }

    //Busca todas las muestras asociadas a esa orden
    const muestrasOrden = await Muestra.findAll({
      include: {
        model: OrdenExamen,
        as: "ordenExamen",
        where: {
          "$ordenExamen.orden_id$": ordenTrabajo.id
        }
      }
    });

    //Verifica si todas las muestras están procesadas
    const todasProcesadas = muestrasOrden.every(
      (m) => m.estado === "procesada"
    );

    // Si todas están procesadas y la orden estaba en "analitica", cambiar a "pre informe"
    if (todasProcesadas) {
      ordenTrabajo.estado = "pre informe";
      await ordenTrabajo.save();

      // Registrar en el historial
      await historialService.crear({
        ordenId: ordenTrabajo.id,
        estadoNuevo: "pre informe",
        descripcion: "Se procesaron las muestras, orden lista para pre informe",
        usuarioId
      });
    }

    res.redirect("/orden/pendientes/muestras");
  } catch (error) {
    console.error("Error al procesar muestra: ", error);
    res.status(500).render("error", {
      message: "Error al procesar la muestra.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

const generarEtiquetaPDF = async (req, res) => {
  try {
    const { ordenId } = req.params;
    await muestraService.generarEtiquetaPDF(ordenId, res);
    
    //registro auditoria
    await auditoriaService.crearAuditoria({
      tablaAfectada: "Muestra",
      registroId: ordenId,
      operacion: "otro",
      detalles: "Se descargó la etiqueta de la muestra",
      usuarioId: req.usuario.id
    });

  } catch (error) {
    console.error("Error en generarEtiquetaPDF: ", error);
    res.status(500).render("error", {
      message: "",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

//obtener las muestras registradas y reimprimir etiquetas
const getMuestrasRegistradas = async (req, res) => {
  try {
    const ordenId = req.params.ordenId;
    const orden = await ordenTrabajoService.getOrdenId(ordenId);

    // Obtener las muestras registradas
    const muestras = await muestraService.obtenerMuestrasPorOrden(ordenId);

    res.render("muestra/muestrasRegistradas", {
      orden,
      muestras,
      role: req.usuario.rol
    });
  } catch (error) {
    console.error("Error en getMuestrasRegistradas:", error.message);
    res.status(500).render("error", {
      message: "Hubo un error al obtener las muestras registradas.",
      role: req.usuario?.rol,
      error: error.message
    });
  }
};

const reimprimirEtiqueta = async (req, res) => {
  try {
    const { muestraId } = req.params;
    const muestra = await muestraService.getMuestraId(muestraId);
    const ordenTrabajoId = muestra.ordenExamen.ordenId;
    const paciente = muestra.paciente;
    const fechaRecepcion = muestra.fechaRecepcion;

    const etiquetaPath = await muestraService.generarEtiqueta(
      ordenTrabajoId,
      paciente,
      fechaRecepcion
    );

    res.download(etiquetaPath, `etiqueta_orden_${ordenTrabajoId}.pdf`);
    //registro auditoria
    await auditoriaService.crearAuditoria({
      tablaAfectada: "Muestra",
      registroId: muestraId,
      operacion: "otro",
      detalles: "Se descargó la etiqueta de la muestra",
      usuarioId: req.usuario.id
    });
  } catch (error) {
    console.error("Error en reimprimirEtiqueta:", error);
    res.status(500).render("error", {
      message: "Hubo un error al reimprimir la etiqueta.",
      role: req.usuario?.rol,
      error: error.message
    });
  }
};

module.exports = {
  getCrearMuestra,
  crearMuestra,
  generarEtiquetaPDF,
  cambiarEstado,
  getMuestrasRegistradas,
  reimprimirEtiqueta
};
