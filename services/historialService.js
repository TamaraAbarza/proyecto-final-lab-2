// services/historialEstadosOrdenService.js
const { HistorialEstadosOrden, sequelize } = require("../models");

const crear = async (datos, transaction) => {
  try {
    const nuevoHistorial = await HistorialEstadosOrden.create(datos, { transaction });
    return nuevoHistorial;
  } catch (error) {
    console.error("Error al crear el historial de estado de la orden:", error);
    throw error;
  }
};

const getHistorialId = async (id) => {
    try {
      const historialEstadoOrden = await HistorialEstadosOrden.findByPk(id, {
        include: [
          { model: models.OrdenTrabajo, as: 'ordenTrabajo' },
          { model: models.Usuario, as: 'usuario' }
        ],
      });
      return historialEstadoOrden;
    } catch (error) {
      console.error(`Error al obtener el historial de estado de la orden con ID ${id}:`, error);
      throw error;
    }
  };
  
  const getAllHistoriales = async (filtros = {}) => {
    try {
      const historialesEstadoOrden = await HistorialEstadosOrden.findAll({
        where: filtros,
        include: [
          { model: models.OrdenTrabajo, as: 'ordenTrabajo' },
          { model: models.Usuario, as: 'usuario' }
        ],
        order: [['createdAt', 'DESC']],
      });
      return historialesEstadoOrden;
    } catch (error) {
      console.error("Error al obtener todos los historiales de estado de la orden:", error);
      throw error;
    }
  };


module.exports = {
  crear,
  getHistorialId,
  getAllHistoriales,
};
