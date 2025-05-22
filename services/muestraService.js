const {
  Muestra,
  OrdenExamen,
  OrdenTrabajo,
  Paciente,
  Resultado,
  Examen,
  sequelize
} = require("../models");
const historialService = require("../services/historialService");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const crearMuestra = async ({
  ordenExamenId,
  pacienteId,
  fechaRecepcion,
  tipoMuestra,
  ordenId,
  usuarioId
}) => {
  const transaction = await sequelize.transaction();

  try {
    // Validar examen y que no tenga muestra
    const ordenExamen = await OrdenExamen.findByPk(ordenExamenId, {
      include: { model: Muestra, as: "muestra" },
      transaction
    });

    if (!ordenExamen) throw new Error("Orden de examen no encontrada.");
    if (ordenExamen.muestra)
      throw new Error("Este examen ya tiene una muestra registrada.");

    // Crear la muestra
    await Muestra.create(
      {
        ordenExamenId,
        pacienteId,
        fechaRecepcion,
        tipoMuestra
      },
      { transaction }
    );

    // Verificar si quedan exámenes sin muestra en la orden
    const examenesPendientes = await OrdenExamen.findAll({
      where: { ordenId },
      include: {
        model: Muestra,
        as: "muestra",
        required: false
      },
      transaction
    });

    const quedanPendientes = examenesPendientes.some(
      (oe) => oe.muestra === null
    );

    // Si no quedan pendientes, actualizar estado y registrar historial
    if (!quedanPendientes) {
      await OrdenTrabajo.update(
        { estado: "analítica" },
        { where: { id: ordenId }, transaction }
      );

      await historialService.crear(
        {
          ordenId,
          estadoNuevo: "analítica",
          descripcion:
            'Todos los exámenes tienen muestra registrada. Estado cambiado a "analítica".',
          usuarioId
        },
        transaction
      );
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    console.error("Error en crearMuestraService:", err.message);
    throw err;
  }
};

/*
const getMuestraId = async (id) => {
  try {
    const muestra = await Muestra.findByPk(id, {
      include: [
        { model: OrdenTrabajo, as: "ordenTrabajo" },
        { model: Paciente, as: "paciente" },
        { model: Resultado, as: "resultados" }
      ]
    });
    return muestra;
  } catch (error) {
    console.error(`Error al obtener la muestra con ID ${id}:`, error);
    throw error;
  }
};
*/

const getMuestraId = async (id) => {
  try {
    const muestra = await Muestra.findByPk(id, {
      include: [
        {
          model: OrdenExamen,
          as: "ordenExamen",
          include: [
            {
              model: OrdenTrabajo,
              as: "ordenTrabajo"
            },
            {
              model: Examen,
              as: "examen"
            }
          ]
        },
        {
          model: Paciente,
          as: "paciente"
        },
        {
          model: Resultado,
          as: "resultados"
        }
      ]
    });

    return muestra;
  } catch (error) {
    console.error(`Error al obtener la muestra con ID ${id}:`, error);
    throw error;
  }
};

const getAllMuestras = async (filtros = {}) => {
  try {
    const muestras = await Muestra.findAll({
      where: filtros,
      include: [
        {
          model: OrdenExamen,
          as: "ordenExamen",
          include: [
            {
              model: OrdenTrabajo,
              as: "ordenTrabajo"
            }
          ]
        },
        {
          model: Paciente,
          as: "paciente"
        },
        {
          model: Resultado,
          as: "resultados"
        }
      ]
    });

    // Verifica si todas las muestras tienen el examen cargado
    muestras.forEach((muestra) => {
      if (!muestra.ordenExamen) {
        console.log(`Muestra sin examen: ${muestra.id}`);
      }
    });

    return muestras;
  } catch (error) {
    console.error("Error al obtener todas las muestras:", error);
    throw new Error("Hubo un error al obtener las muestras. " + error.message);
  }
};

const cambiarEstado = async (muestraId, estado, usuarioId) => {
  try {
    const muestra = await Muestra.findByPk(muestraId, {
      include: {
        model: OrdenExamen,
        as: 'ordenExamen',
        include: {
          model: OrdenTrabajo,
          as: 'ordenTrabajo',
        }
      }
    });
    if (!muestra) throw new Error(`Muestra ${muestraId} no encontrada`);

    muestra.estado = estado;
    await muestra.save();

    if (estado === 'procesada') {
      const ordenTrabajo = muestra.ordenExamen.ordenTrabajo;

      // Buscar todas las muestras de esa orden
      const muestrasOrden = await Muestra.findAll({
        include: {
          model: OrdenExamen,
          as: 'ordenExamen',
          where: { ordenId: ordenTrabajo.id }
        }
      });

      const todasProcesadas = muestrasOrden.every(m => m.estado === 'procesada');

      if (todasProcesadas && ordenTrabajo.estado === 'analítica') {
        ordenTrabajo.estado = 'pre informe';
        await ordenTrabajo.save();

        await historialService.crear({
          ordenId: ordenTrabajo.id,
          estadoNuevo: 'pre informe',
          descripcion: 'Se procesaron todas las muestras, orden lista para pre informe',
          usuarioId
        });
      }
    }
    return muestra;
  } catch (error) {
    console.error(
      `Error al cambiar el estado de la muestra ${muestraId}: `,
      error
    );
    throw error;
  }
};

/*
const verificarEstadoMuestra = async (ordenId) => {
  try {
    const orden = await OrdenTrabajo.getOrdenId(ordenId, {
      include: [
        {
          model: OrdenExamen,
          as: "ordenesExamenes",
          include: [
            {
              model: Muestra,
              as: "muestra"
            }
          ]
        }
      ]
    });

    if (!orden) {
      throw new Error("Orden no encontrada.");
    }

    // Verificar si todas las muestras de la orden tienen el estado "procesada"
    const todasProcesadas = orden.ordenesExamenes.every((ordenExamen) => {
      const muestra = ordenExamen.muestra;
      return muestra && muestra.estado === "procesada";
    });

    // Si todas las muestras están procesadas, actualizamos el estado de la orden
    if (todasProcesadas) {
      orden.estado = "pre informe";
      await orden.save();

      // Registrar en el historial
      await historialService.crear({
        ordenId: ordenId,
        estadoNuevo: "pre informe",
        descripcion: "Se procesaron las muestras, orden lista para pre informe",
        usuarioId
      });

      console.log(
        `Estado de la orden con ID ${ordenId} actualizado a "pre informe".`
      );
    } else {
      console.log(
        `No todas las muestras de la orden con ID ${ordenId} están procesadas.`
      );
    }
  } catch (error) {
    console.error("Error al verificar el estado de la muestra:", error);
    throw new Error(
      `Error al verificar el estado de la muestra de la orden con ID ${ordenId}: ${error.message}`
    );
  }
};
*/

const generarEtiqueta = async (ordenId, paciente, fechaRecepcion) => {
  try {
    // Directorio donde se guardan las etiquetas
    const etiquetasDir = path.join(__dirname, "../public/etiquetas");
    // Si no existe, crearlo (con todos los padres necesarios)
    if (!fs.existsSync(etiquetasDir)) {
      fs.mkdirSync(etiquetasDir, { recursive: true });
    }

    // Ruta completa del archivo
    const outputPath = path.join(etiquetasDir, `etiqueta_orden_${ordenId}.pdf`);

    // Crear el documento PDF
    const doc = new PDFDocument({ size: [144, 72], margin: 5 });

    // Abrir stream de escritura
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Agregar contenido
    doc
      .fontSize(8)
      .text(`No de Orden: ${ordenId}`, { align: "left" })
      .text(`Código de Persona: ${paciente.id}`, { align: "left" })
      .text(`Nombre: ${paciente.nombre} ${paciente.apellido}`, {
        align: "left"
      })
      .text(`Documento: ${paciente.dni}`, { align: "left" })
      .text(`Fecha y Hora: ${new Date(fechaRecepcion).toLocaleString()}`, {
        align: "left"
      });

    // Finalizar el PDF
    doc.end();

    // Esperar a que termine de escribir el archivo
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    return outputPath;
  } catch (error) {
    console.error("Error al generar la etiqueta:", error);
    throw error;
  }
};

const obtenerMuestrasPorOrden = async (ordenId) => {
  try {
    const muestras = await Muestra.findAll({
      include: [
        {
          model: OrdenExamen,
          as: "ordenExamen",
          where: { ordenId: ordenId },
          attributes: []
        }
      ],
      // Si quieres traer también los resultados de cada muestra:
      // include: [
      //   { model: OrdenExamen, as: 'ordenExamen', where: { ordenId: ordenTrabajoId }, attributes: [] },
      //   { model: models.Resultado, as: 'resultados' }
      // ],
      order: [["fechaRecepcion", "ASC"]]
    });

    return muestras;
  } catch (error) {
    console.error("Error al obtener muestras por orden:", error);
    throw error;
  }
};
/*
const actualizarMuestra = async (id, datos) => {
  try {
    const muestra = await Muestra.findByPk(id);
    if (!muestra) {
      throw new Error(`Muestra con ID ${id} no encontrada.`);
    }
    await muestra.update(datos);
    return muestra;
  } catch (error) {
    console.error(`Error al actualizar la muestra con ID ${id}:`, error);
    throw error;
  }
};

const eliminarMuestra = async (id) => {
  try {
    // Eliminar una muestra (cambiar su estado a "eliminada")
    const muestra = await Muestra.findByPk(id);
    if (!muestra) {
      throw new Error(`Muestra con ID ${id} no encontrada.`);
    }
    await muestra.update({ estado: "eliminada" });
    return true;
  } catch (error) {
    console.error(`Error al eliminar la muestra con ID ${id}:`, error);
    throw error;
  }
};
*/

module.exports = {
  crearMuestra,
  getMuestraId,
  getAllMuestras,
  cambiarEstado,
  generarEtiqueta,
  obtenerMuestrasPorOrden
  //actualizarMuestra,
  //eliminarMuestra,
};
