// services/auditoriaService.js
const { Auditoria, sequelize, Usuario } = require("../models");

const crearAuditoria = async ({
  tablaAfectada,
  registroId,
  operacion,
  detalles,
  usuarioId
}) => {
  try {
    return await Auditoria.create({
      tablaAfectada,
      registroId,
      operacion,
      detalles,
      usuarioId
    });
  } catch (error) {
    console.error("Error al crear la auditoría:", error);
    throw new Error("No se pudo registrar la auditoría.");
  }
};

const getAllAuditoria = async (filtros = {}) => {
  try {
    const auditorias = await Auditoria.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombreUsuario", "correo"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return auditorias;
  } catch (error) {
    console.error("Error al obtener las auditorías:", error);
    throw new Error("No se pudo obtener el historial de auditoría.");
  }
};

module.exports = {
  crearAuditoria,
  getAllAuditoria
};
