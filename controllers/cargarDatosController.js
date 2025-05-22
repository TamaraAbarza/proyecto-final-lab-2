const auditoriaService = require("../services/auditoriaService");
const examenService = require("../services/examenService");
const determinacionService =  require("../services/determinacionService");
const valorReferenciaService = require("../services/valorReferenciaService");

const listar = async (req, res) => {
  try {
    const examenes = await examenService.getAllExamenes();
    const determinaciones = await determinacionService.getAllDeterminaciones();
    const valoresReferencia =
      await valorReferenciaService.getAllValoresReferencia();
    res.render("cargaDatos/listarDatos", {
      title: "Panel de Control",
      examenes,
      determinaciones,
      valoresReferencia,
      role: req.usuario?.rol
    });
  } catch (error) {
    console.error("Error al mostrar los datos:", error);
    res.status(500).render("error", {
      message: "Hubo un error al cargar el panel",
      role: req.usuario?.rol,
      error: error.message
    });
  }
};

// auditoria
const listarAuditorias = async (req, res) => {
  try {
    const auditoria = await auditoriaService.getAllAuditoria();

    res.render("auditoria/listado", {
      title: "Auditoria",
      historial: auditoria,
      role: req.usuario?.rol
    });
  } catch (error) {
    res.status(500).render("error", {
      message: "Hubo un error al cargar la auditoria",
      role: req.usuario?.rol,
      error: error.message
    });
    console.error("Error al mostrar los datos:", error);
  }
};

module.exports = { listar, listarAuditorias };
