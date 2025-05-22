// services/ordenTrabajoService.js
const {
  OrdenTrabajo,
  Paciente,
  Examen,
  OrdenExamen,
  HistorialEstadosOrden,
  Muestra,
  Resultado,
  Usuario,
  Determinacion,
  sequelize
} = require("../models");

const historialService = require("../services/historialService");
const muestraService = require("../services/muestraService");
const examenService = require("../services/examenService");
const { Op } = require("sequelize");

const crearOrdenTrabajo = async (
  pacienteId,
  diagnostico,
  fechaCreacion,
  observaciones,
  rawExamenes,
  rawMuestras,
  usuarioId
) => {
  try {
    // Asegurar de que rawExamenes sea array
    if (!Array.isArray(rawExamenes)) {
      rawExamenes = rawExamenes ? [rawExamenes] : [];
    }

    // Asegurar de que rawMuestras sea array
    if (!rawMuestras) {
      rawMuestras = [];
    } else if (!Array.isArray(rawMuestras)) {
      rawMuestras = [rawMuestras];
    }

    // Construir el array con objetos { examenId, muestraTraida }
    const examenesProcesados = rawExamenes
      .map((idStr) => {
        const examenId = parseInt(idStr, 10);
        if (isNaN(examenId)) return null;
        const muestraTraida = rawMuestras.includes(idStr);
        return { examenId, muestraTraida };
      })
      .filter((obj) => obj !== null);

    // Validaciones
    if (
      !pacienteId ||
      !diagnostico ||
      !fechaCreacion ||
      examenesProcesados.length === 0
    ) {
      throw new Error("Faltan datos obligatorios o no seleccionaste exámenes");
    }

    // Obtener los días estimados de los exámenes seleccionados
    const examenesConDiasEstimados = await Promise.all(
      examenesProcesados.map(async ({ examenId }) => {
        const examen = await examenService.getExamenId(examenId);
        return examen ? examen.diasEstimadosResultados : 0;
      })
    );

    // Determinar el número máximo de días de los exámenes seleccionados
    const maxDiasEstimados = Math.max(...examenesConDiasEstimados);

    // Calcular la fecha de entrega sumando los días estimados a la fecha de creación
    const fechaEntrega = new Date(fechaCreacion);
    fechaEntrega.setDate(fechaEntrega.getDate() + maxDiasEstimados);

    // Crear la orden de trabajo con la fecha de entrega calculada
    const nuevaOrden = await OrdenTrabajo.create({
      pacienteId: parseInt(pacienteId, 10),
      diagnostico,
      fechaCreacion,
      fechaEntrega,
      observaciones,
      estado: "esperando toma de muestra"
    });

    let todasMuestrasTraidas = true;

    // Procesar los exámenes y muestras
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

    // Si todas las muestras fueron traídas, actualizamos el estado
    if (todasMuestrasTraidas) {
      nuevaOrden.estado = "analítica";
      await nuevaOrden.save();
    }

    // Registrar en el historial
    await historialService.crear({
      ordenId: nuevaOrden.id,
      estadoNuevo: nuevaOrden.estado,
      descripcion: "Orden creada",
      usuarioId
    });

    return nuevaOrden;
  } catch (error) {
    console.error("Error en crearOrdenTrabajo:", error);
    throw error;
  }
};

const getOrdenId = async (id, filtros = {}) => {
  try {
    const orden = await OrdenTrabajo.findOne({
      where: { id, ...filtros },
      include: [
        {
          model: Paciente,
          as: "paciente",
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["correo"]
            }
          ]
        },
        {
          model: OrdenExamen,
          as: "ordenesExamenes",
          include: [
            {
              model: Examen,
              as: "examen"
            },
            {
              model: Muestra,
              as: "muestra"
            }
          ]
        },
        {
          model: Resultado,
          as: "resultados"
        },
        {
          model: HistorialEstadosOrden,
          as: "historialEstadosOrden"
        }
      ]
    });

    if (!orden) throw new Error("Orden no encontrada.");
    return orden;
  } catch (err) {
    console.error("Error al obtener la orden:", err.message);
    throw new Error(`Error al obtener la orden con ID ${id}: ${err.message}`);
  }
};

const getHistorialEstados = async () => {
  try {
    return await HistorialEstadosOrden.findAll({
      include: [
        {
          model: OrdenTrabajo,
          as: "ordenTrabajo",
          include: [{ model: Paciente, as: "paciente" }]
        },
        { model: Usuario, as: "usuario" }
      ],
      order: [["createdAt", "DESC"]]
    });
  } catch (err) {
    console.error("Error al obtener el historial de estados:", err.message);
    throw new Error(`Error al obtener el historial de estados: ${err.message}`);
  }
};

const getAllOrdenes = async (filtros = {}) => {
  try {
    return OrdenTrabajo.findAll({
      where: filtros,
      include: [
        {
          model: Paciente,
          as: "paciente",
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["correo"]
            }
          ]
        },
        {
          model: OrdenExamen,
          as: "ordenesExamenes",
          include: [
            {
              model: Examen,
              as: "examen"
            },
            {
              model: Muestra,
              as: "muestra"
            }
          ]
        },
        {
          model: Resultado,
          as: "resultados"
        }
      ],
      order: [["fechaCreacion", "DESC"]]
    });
  } catch (err) {
    console.error("Error al obtener todas las órdenes:", err.message);
    throw new Error(`Error al obtener las órdenes: ${err.message}`);
  }
};

const actualizarOrdenTrabajo = async (
  ordenId,
  pacienteId,
  diagnostico,
  fechaCreacion,
  observaciones,
  rawExamenes,
  rawMuestras,
  usuarioId
) => {
  try {
    // Normalizar a array
    if (!Array.isArray(rawExamenes)) {
      rawExamenes = rawExamenes ? [rawExamenes] : [];
    }
    if (!rawMuestras) {
      rawMuestras = [];
    } else if (!Array.isArray(rawMuestras)) {
      rawMuestras = [rawMuestras];
    }

    // Armar [{ examenId, muestraTraida }]
    const examenesProcesados = rawExamenes
      .map((idStr) => {
        const examenId = parseInt(idStr, 10);
        if (isNaN(examenId)) return null;
        return {
          examenId,
          muestraTraida: rawMuestras.includes(idStr)
        };
      })
      .filter((x) => x);

    // Validación
    if (
      !pacienteId ||
      !diagnostico ||
      !fechaCreacion ||
      examenesProcesados.length === 0
    ) {
      throw new Error("Faltan datos obligatorios o no seleccionaste exámenes");
    }

    const orden = await OrdenTrabajo.findByPk(ordenId);
    if (!orden) {
      throw new Error("Orden de trabajo no encontrada.");
    }

    // Calcular fecha de entrega
    const diasPorExamen = await Promise.all(
      examenesProcesados.map(({ examenId }) =>
        ExamenService.getExamenId(examenId).then(
          (ex) => ex?.diasEstimadosResultados ?? 0
        )
      )
    );
    const maxDias = Math.max(...diasPorExamen, 0);
    const fechaEntrega = new Date(fechaCreacion);
    fechaEntrega.setDate(fechaEntrega.getDate() + maxDias);

    // Actualizar la orden con los nuevos datos
    orden.diagnostico = diagnostico;
    orden.fechaCreacion = fechaCreacion;
    orden.fechaEntrega = fechaEntrega;
    orden.observaciones = observaciones;
    await orden.save();

    // Eliminar las muestras y exámenes previos
    const examenesPrevios = await OrdenExamen.findAll({
      where: { ordenId: orden.id },
      attributes: ["id"]
    });
    const idsPrevios = examenesPrevios.map((e) => e.id);
    if (idsPrevios.length > 0) {
      await Muestra.destroy({
        where: { ordenExamenId: { [Op.in]: idsPrevios } }
      });
    }

    // Eliminar los exámenes previos
    await OrdenExamen.destroy({ where: { ordenId: orden.id } });

    // Crear los nuevos OrdenExamen y Muestra
    let todasTraidas = true;
    for (const { examenId, muestraTraida } of examenesProcesados) {
      const oe = await OrdenExamen.create({ ordenId: orden.id, examenId });
      if (muestraTraida) {
        const tipoMuestra = await ExamenService.getTipoMuestra(examenId);
        await Muestra.create({
          ordenExamenId: oe.id,
          pacienteId: parseInt(pacienteId, 10),
          tipoMuestra
        });
      } else {
        todasTraidas = false;
      }
    }

    if (todasTraidas) {
      orden.estado = "analítica";
      await orden.save();
    }

    // Registrar el historial de cambios en el estado
    await HistorialEstadosOrden.crear({
      ordenId: orden.id,
      estadoNuevo: orden.estado,
      descripcion: "Orden modificada",
      usuarioId
    });

    return orden;
  } catch (error) {
    console.error("Error en actualizarOrden:", error);
    throw error;
  }
};

const eliminarOrdenTrabajo = async (ordenId) => {
  const t = await sequelize.transaction();

  try {
    // Eliminar las muestras asociadas a los OrdenExamen
    await Muestra.destroy({
      where: {
        ordenExamenId: {
          [Op.in]: sequelize.literal(
            `(SELECT id FROM ordenes_examen WHERE orden_id = ${ordenId})`
          )
        }
      },
      transaction: t
    });

    // Eliminar las relaciones asociadas a los exámenes (OrdenExamen)
    await OrdenExamen.destroy({
      where: { ordenId },
      transaction: t
    });

    // Eliminar los resultados asociados a la orden de trabajo
    await Resultado.destroy({
      where: { ordenId },
      transaction: t
    });

    // Eliminar el historial de estados de la orden
    await HistorialEstadosOrden.destroy({
      where: { ordenId },
      transaction: t
    });

    // Eliminar la orden de trabajo principal
    const resultado = await OrdenTrabajo.destroy({
      where: { id: ordenId },
      transaction: t
    });

    // Confirmar la transacción si todo salió bien
    await t.commit();

    return resultado === 1; // Si se eliminó una orden
  } catch (error) {
    // Si algo falla, revertimos todo lo hecho en la transacción
    await t.rollback();
    console.error("Error al eliminar orden de trabajo:", error);
    throw new Error("Error al eliminar la orden y sus relaciones.");
  }
};

//para registrar resultados de los examenes de una orden - técnico
const getOrdenConDeterminaciones = async (idOrden) => {
  try {
    const orden = await OrdenTrabajo.findByPk(idOrden, {
      include: [
        {
          model: Paciente,
          as: "paciente"
        },
        {
          model: OrdenExamen,
          as: "ordenesExamenes",
          include: [
            {
              model: Examen,
              as: "examen",
              include: [
                {
                  model: Determinacion,
                  as: "determinaciones"
                }
              ]
            },
            {
              model: Muestra,
              as: "muestra"
            }
          ]
        }
      ]
    });

    return orden;
  } catch (error) {
    console.error("Error al obtener la orden con determinaciones:", error);
    throw error;
  }
};

const getOrdenesUsuarioId = async (usuarioId) => {
  try {
    const paciente = await Paciente.findOne({
      where: {
        usuarioId: usuarioId
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "correo"]
        },
        {
          model: OrdenTrabajo,
          as: "ordenesTrabajo",
          include: [
            {
              model: OrdenExamen,
              as: "ordenesExamenes",
              include: [
                {
                  model: Examen,
                  as: "examen"
                },
                {
                  model: Muestra,
                  as: "muestra"
                }
              ]
            },
            {
              model: Resultado,
              as: "resultados"
            }
          ]
        }
      ]
    });

    if (!paciente) {
      throw new Error("Paciente no encontrado.");
    }

    return paciente;
  } catch (err) {
    console.error("Error al obtener el paciente:", err.message);
    throw new Error("Error al obtener el paciente.");
  }
};


module.exports = {
  crearOrdenTrabajo,
  getOrdenId,
  getHistorialEstados,
  getAllOrdenes,
  actualizarOrdenTrabajo,
  eliminarOrdenTrabajo,
  getOrdenConDeterminaciones, getOrdenesUsuarioId
};
