// services/valorReferenciaService.js
const { ValorReferencia, sequelize, Determinacion } = require("../models");

const crearValorReferencia = async (datos) => {
  try {
    const nuevoValorReferencia = await ValorReferencia.create(datos);
    return nuevoValorReferencia;
  } catch (error) {
    console.error("Error al crear el valor de referencia:", error);
    throw error;
  }
};

const getValorReferenciaId = async (id) => {
  try {
    const valorReferencia = await ValorReferencia.findByPk(id);
    return valorReferencia;
  } catch (error) {
    console.error(`Error al obtener el valor de referencia con ID ${id}:`, error);
    throw error;
  }
};

const getAllValoresReferencia = async (filtros = {}) => {
  try {
    const valoresReferencia = await ValorReferencia.findAll({
      where: filtros,
      include: [
        {
          model: Determinacion,
          as: 'determinacion',
          attributes: ['nombreDeterminacion'],
        },
      ],
    });
    return valoresReferencia;
  } catch (error) {
    console.error("Error al obtener todos los valores de referencia:", error);
    throw error;
  }
};

const actualizarValorReferencia = async (id, datos) => {
  try {
    const valorReferencia = await ValorReferencia.findByPk(id);
    if (!valorReferencia) {
      throw new Error(`Valor de referencia con ID ${id} no encontrado.`);
    }
    await valorReferencia.update(datos);
    return valorReferencia;
  } catch (error) {
    console.error(`Error al actualizar el valor de referencia con ID ${id}:`, error);
    throw error;
  }
};

const eliminarValorReferencia = async (id) => {
  try {
    const valorReferencia = await ValorReferencia.findByPk(id);
    if (!valorReferencia) {
      throw new Error(`Valor de referencia con ID ${id} no encontrado.`);
    }
    await valorReferencia.update({ estado: false });
    return true;
  } catch (error) {
    console.error(`Error al eliminar el valor de referencia con ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  crearValorReferencia,
  getValorReferenciaId,
  getAllValoresReferencia,
  actualizarValorReferencia,
  eliminarValorReferencia,
};