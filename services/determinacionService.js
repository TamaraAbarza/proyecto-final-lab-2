// services/determinacionService.js
const { Determinacion, sequelize, Examen } = require("../models");

const crearDeterminacion = async (datos) => {
  try {
    const nuevaDeterminacion = await Determinacion.create(datos);
    return nuevaDeterminacion;
  } catch (error) {
    console.error("Error al crear la determinación:", error);
    throw error;
  }
};

const getDeterminacionId = async (id) => {
  try {
    const determinacion = await Determinacion.findByPk(id);
    return determinacion;
  } catch (error) {
    console.error(`Error al obtener la determinación con ID ${id}:`, error);
    throw error;
  }
};

const getAllDeterminaciones = async (filtros = {}) => {
  try {
    const determinaciones = await Determinacion.findAll({
      where: filtros,
      include: [
        {
          model: Examen,
          as: 'examen',
          attributes: ['nombreExamen']
        }
      ]
    });
    return determinaciones;
  } catch (error) {
    console.error("Error al obtener todas las determinaciones:", error);
    throw error;
  }
};

const actualizarDeterminacion = async (id, datos) => {
  try {
    const determinacion = await Determinacion.findByPk(id);
    if (!determinacion) {
      throw new Error(`Determinación con ID ${id} no encontrada.`);
    }
    await determinacion.update(datos);
    return determinacion;
  } catch (error) {
    console.error(`Error al actualizar la determinación con ID ${id}:`, error);
    throw error;
  }
};

const eliminarDeterminacion = async (id) => {
  try {
    const determinacion = await Determinacion.findByPk(id);
    if (!determinacion) {
      throw new Error(`Determinación con ID ${id} no encontrada.`);
    }
    await determinacion.update({ estado: false });
    return true;
  } catch (error) {
    console.error(`Error al eliminar la determinación con ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  crearDeterminacion,
  getDeterminacionId,
  getAllDeterminaciones,
  actualizarDeterminacion,
  eliminarDeterminacion,
};