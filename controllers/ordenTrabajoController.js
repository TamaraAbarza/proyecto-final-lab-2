const ordenTrabajoService = require("../services/ordenTrabajoService");
const ExamenService = require("../services/examenService");
const muestraService = require("../services/muestraService");

//vista de creación de orden
const getCrearOrden = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    if (!pacienteId) {
      return res.status(400).send("El ID del paciente es requerido");
    }
    const examenes = await ExamenService.getAllExamenes();
    res.render("orden/formOrden", { pacienteId, examenes, role: req.usuario.rol}, );
   } catch (error) {
    console.error("Error en getcrearOrden:", error);
    res.status(500).render("error", {
      message: "Hubo un error al renderizar la vista de orden.",
      role: req.usuario?.rol,
      error: error.message
    });
  }
};

const crearOrden = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const {
      pacienteId,
      diagnostico,
      fechaCreacion,
      observaciones,
      examenesSeleccionados: rawExamenes,
      muestrasTraidas: rawMuestras
    } = req.body;

    const nuevaOrden = await ordenTrabajoService.crearOrdenTrabajo(
      pacienteId,
      diagnostico,
      fechaCreacion,
      observaciones,
      rawExamenes,
      rawMuestras,
      usuarioId
    );

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

const getActualizarOrden = async (req, res) => {
  try {
    const { ordenId } = req.params;
    if (!ordenId) {
      return res.status(400).send("El ID de la orden de trabajo es requerido.");
    }

    const orden = await ordenTrabajoService.getOrdenId(ordenId);
    if (!orden) {
      return res.status(404).send("Orden de trabajo no encontrada.");
    }

    const examenes = await ExamenService.getAllExamenes();

    // IDs de exámenes y muestras ya asociadas
    const examenesSeleccionados = orden.ordenesExamenes.map(oe => oe.examen.id);
    const muestrasTraidas = orden.ordenesExamenes
      .filter(oe => oe.muestra)
      .map(oe => oe.examen.id);

    res.render("orden/formOrden", {
      pacienteId: orden.pacienteId,
      orden,
      examenes,
      examenesSeleccionados,
      muestrasTraidas
    });

  } catch (error) {
    console.error("Error en getActualizarOrden:", error);
    res.status(500).render("error", {
      message: "Hubo un error al cargar los datos de la orden.",
      role: req.usuario?.rol,
      error: error.message
    });
  }
};

const actualizarOrden = async (req, res) => {
  const usuarioId = req.usuario.id;
  try {
    const {
      ordenId,
      pacienteId,
      diagnostico,
      fechaCreacion,
      observaciones,
      examenesSeleccionados: rawExamenes,
      muestrasTraidas: rawMuestras
    } = req.body;

    const ordenActualizada = await ordenTrabajoService.actualizarOrdenTrabajo(
      ordenId,
      pacienteId,
      diagnostico,
      fechaCreacion,
      observaciones,
      rawExamenes,
      rawMuestras,
      usuarioId
    );

    res.redirect("/orden/all");
  } catch (error) {
    console.error("Error en actualizarOrden:", error);
    res.status(500).render("error", {
      message: "Hubo un error al actualizar la orden.",
      role: req.usuario?.rol,
      error: error.message
    });
  }
};

const eliminarOrden = async (req, res) => {
  try {
    const { ordenId } = req.params;

    const result = await ordenTrabajoService.eliminarOrdenTrabajo(
      ordenId,
      req.usuario.id
    );

    if (result) {
      res.redirect("/orden/all");
    } else {
      res.status(404).send("Orden no encontrada");
    }
  } catch (error) {
    console.error("Error eliminarOrden:", error);
    res.status(500).render("error", {
      message: "Hubo un error al eliminar la orden.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

// Obtener las ordenes pendientes de registrar muestras (estado "esperando toma de muestra")
const getOrdenesPendientes = async (req, res) => {
  try {
    const ordenes  = await ordenTrabajoService.getAllOrdenes({
      estado: "esperando toma de muestra"
    });

    // Muestras para pre informe - Confirmar
    const muestras = await muestraService.getAllMuestras();

    res.render("orden/ordenesPendientes", {
      ordenes: ordenes,
      muestras: muestras,
      role: req.usuario.rol
    });
  } catch (error) {
    console.error("Error al obtener ordenes pendientes: ", error);
    res.status(500).render("error", {
      message: "Hubo un error al obtener las ordenes pendientes.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

//lista todas las ordenes de trabajo:
const getAllOrdenes = async (req, res) => {
  try {
    const ordenes = await ordenTrabajoService.getAllOrdenes();
    res.render("orden/listaOrden", {
      ordenes,
      role: req.usuario.rol
    });
  } catch (error) {
    console.error("Error al obtener ordenes: ", error);
    res.status(500).render("error", {
      message: "Hubo un error al obtener las ordenes.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

// Obtener el historial de estados de una orden
const getHistorialEstados = async (req, res) => {
  try {
    const historial = await ordenTrabajoService.getHistorialEstados();
    res.render("orden/historialOrden", {
      historial: historial || [],
      role: req.usuario.rol
    });
  } catch (error) {
    console.error("Error al obtener historial de estados: ", error);
    res.status(500).render("error", {
      message: "Hubo un error al obtener el historial de estados.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

// Obtener los detalles de una orden de trabajo --- Para registrar examenes - técnico 
const getOrdenDetalle = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const { action } = req.query;

    const orden = await ordenTrabajoService.getOrdenConDeterminaciones(ordenId);
    if (!orden) {
      return res.status(404).send("Orden no encontrada");
    }

    res.render("orden/detalleOrden", {
      orden,
      role: req.usuario.rol,
      action
    });
  } catch (error) {
    console.error("Error al renderizar vista getOrdenDetalle: ", error);
    res.status(500).render("error", {
      message: "Hubo un error al obtener los detalles de la orden.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};


//vista que muestra listas de ordenes para cargar resultados - técnico
const getOrdenesPreInforme = async (req, res) => {
  try {
    const ordenesPreinforme = await ordenTrabajoService.getAllOrdenes({
      estado: "pre informe"
    });

    const ordenesParaValidar = await ordenTrabajoService.getAllOrdenes({
      estado: "para validar"
    });

    res.render("orden/ordenesPreInforme", {
      orders: ordenesPreinforme,
      role: req.usuario.rol,
      estado: "pre informe",
      ordersParaValidar: ordenesParaValidar
    });
  } catch (error) {
    console.error("Error al obtener ordenes para registrar el resultado: ", error);
    res.status(500).render("error", {
      message: "Hubo un error al obtener las ordenes en estado Pre informe.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

//vista que muestra listas de ordenes para validar - bioquimico
const getOrdenesValidar = async (req, res) => {
  try {
    const ordenes = await ordenTrabajoService.getAllOrdenes({
      estado: "para validar"
    });

    const ordenesInformadas = await ordenTrabajoService.getAllOrdenes({
      estado: "informada"
    });

    res.render("orden/ordenesPreInforme", {
      orders: ordenes,
      role: req.usuario.rol,
      estado: "para validar",
      ordersParaValidar: ordenesInformadas,
    });
  } catch (error) {
    console.error("Error al obtener ordenes para registrar el resultado: ", error);
    res.status(500).render("error", {
      message: "Hubo un error al obtener las ordenes en estado Pre informe.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};


module.exports = {
  crearOrden,
  getCrearOrden,
  getOrdenDetalle,
  getOrdenesPendientes,
  getHistorialEstados,
  getActualizarOrden,
  actualizarOrden,
  eliminarOrden,
  getAllOrdenes,
  getOrdenesPreInforme,
  getOrdenesValidar,
};
