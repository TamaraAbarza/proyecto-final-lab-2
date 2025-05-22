// services/examenService.js
const {
  Examen,
  OrdenTrabajo,
  Determinacion,
  Muestra,
  sequelize,
  Resultado,
  OrdenExamen,
  ValorReferencia
} = require("../models");
const historialService = require("../services/historialService");

const crearExamen = async (datos) => {
  try {
    const nuevoExamen = await Examen.create(datos);
    return nuevoExamen;
  } catch (error) {
    console.error("Error al crear el examen:", error);
    throw error;
  }
};

const getExamenId = async (id) => {
  try {
    const examen = await Examen.findByPk(id);
    return examen;
  } catch (error) {
    console.error(`Error al obtener el examen con ID ${id}:`, error);
    throw error;
  }
};

const getTipoMuestra = async (id) => {
  try {
    const examen = await Examen.findByPk(id);
    if (examen) {
      return examen.tipoMuestra;
    }
    return null;
  } catch (error) {
    console.error(`Error al obtener el tipo de muestra: `, error);
    throw error;
  }
};

const getAllExamenes = async (filtros = {}) => {
  try {
    const examenes = await Examen.findAll({
      where: {
        ...filtros, // Filtros adicionales pasados como parámetros
        estado: true
      }
    });
    return examenes;
  } catch (error) {
    console.error("Error al obtener todos los exámenes:", error);
    throw error;
  }
};

const actualizarExamen = async (id, datos) => {
  try {
    const examen = await Examen.findByPk(id);
    if (!examen) {
      throw new Error(`Examen con ID ${id} no encontrado.`);
    }
    await examen.update(datos);
    return examen;
  } catch (error) {
    console.error(`Error al actualizar el examen con ID ${id}:`, error);
    throw error;
  }
};

const eliminarExamen = async (id) => {
  try {
    const examen = await Examen.findByPk(id);
    if (!examen) {
      throw new Error(`Examen no encontrado.`);
    }
    await examen.update({ estado: false });
    return true;
  } catch (error) {
    console.error(`Error al eliminar el examen: `, error);
    throw error;
  }
};

/*
const getDatosParaResultado = async (examenId, ordenId) => {
  try {
    const ordenExamen = await OrdenExamen.findOne({
      where: { examenId, ordenId },  // Aseguramos que el examen pertenezca a la orden de trabajo específica
      include: [
        {
          model: Examen,
          as: "examen",
          include: [
            {
              model: Determinacion,
              as: "determinaciones",
            },
          ],
        },
        {
          model: Muestra,
          as: "muestra",
        },
        {
          model: OrdenTrabajo,
          as: "ordenTrabajo",
          include: ["paciente"],
        },
      ],
    });

    if (!ordenExamen) {
      throw new Error(`No se encontraron datos para el examen con ID: ${examenId} en la orden de trabajo con ID: ${ordenId}`);
    }

    return ordenExamen;
  } catch (error) {
    console.error(`Error al obtener datos para el resultado: `, error);
    throw error;
  }
};*/

const getDatosParaResultado = async (examenId, ordenId) => {
  try {
    const ordenExamen = await OrdenExamen.findOne({
      where: { examenId, ordenId },
      include: [
        {
          model: Examen,
          as: "examen",
          include: [
            {
              model: Determinacion,
              as: "determinaciones",
              include: [
                {
                  model: ValorReferencia,
                  as: "valoresReferencia",
                  required: false
                }
              ]
            }
          ]
        },
        {
          model: Muestra,
          as: "muestra"
        },
        {
          model: OrdenTrabajo,
          as: "ordenTrabajo",
          include: ["paciente"]
        }
      ]
    });

    if (!ordenExamen) {
      throw new Error(`No hay examen ${examenId} en orden ${ordenId}`);
    }
    return ordenExamen;
  } catch (error) {
    console.error("Error al obtener datos para resultado:", error);
    throw error;
  }
};

const obtenerResultadosPorOrden = async (ordenId) => {
  // Asumimos que Resultado tiene columna ordenId
  const resultados = await Resultado.findAll({
    where: { ordenId },
    attributes: ["id", "determinacionId", "valorFinal"]
  });

  return resultados.reduce((map, r) => {
    map[r.determinacionId] = { id: r.id, valorFinal: r.valorFinal };
    return map;
  }, {});
};

//comprobar si se registraron todos los resultados de examenes
const verificarCargaResultados = async (ordenId, usuarioId) => {
  const ordenExamenes = await OrdenExamen.findAll({
    where: { ordenId },
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
      }
    ]
  });

  let totalDeterminaciones = 0;
  let totalResultados = 0;

  for (const oe of ordenExamenes) {
    const examen = oe.examen;
    if (!examen || !examen.determinaciones) continue;

    for (const det of examen.determinaciones) {
      totalDeterminaciones++;
      const resultado = await Resultado.findOne({
        where: {
          ordenId,
          determinacionId: det.id
        }
      });
      if (resultado) totalResultados++;
    }
  }

  if (totalDeterminaciones > 0 && totalDeterminaciones === totalResultados) {
    await OrdenTrabajo.update(
      { estado: "para Validar" },
      { where: { id: ordenId } }
    );

    // Registrar en el historial
    await historialService.crear({
      ordenId,
      estadoNuevo: "para Validar",
      descripcion: "Se registró el total de los resultados",
      usuarioId
    });
    return true;
  }

  return false;
};

module.exports = {
  crearExamen,
  getExamenId,
  getAllExamenes,
  actualizarExamen,
  eliminarExamen,
  getTipoMuestra,
  getDatosParaResultado,
  verificarCargaResultados,
  obtenerResultadosPorOrden
};
