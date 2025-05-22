const Paciente = require("../models/paciente");
const pacienteService = require("../services/pacienteService");
const usuarioService = require("../services/usuarioService");
const ordenTrabajoService = require("../services/ordenTrabajoService");
const auditoriaService = require("../services/auditoriaService"); 

//vista de busqueda de paciente por dni
const busquedaPaciente = async (req, res) => {
  try {
    res.render("paciente/buscarPaciente", {
      title: "Búsqueda por dni",
      role: req.usuario.rol
    });
  } catch (error) {
    console.error("Error al renderizar vista buscarPaciente: ", error);
    res.status(500).render("error", {
      message: "",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

//buscar paciente por DNI
const getDni = async (req, res) => {
  try {
    const { dni } = req.query;
    let paciente = null;
    let isEditMode = false;

    paciente = await pacienteService.getPacientePorDni(dni);

    if (paciente) {
      isEditMode = true;
    }

    // Renderiza la misma vista según si es creación o edición
    return res.render("paciente/pacienteForm", {
      title: isEditMode ? "Editar Paciente" : "Registrar Paciente",
      paciente, // Puede ser null si es creación
      dni, // se pasa el dni para la creacion
      isEditMode, // Determina si es modo edición
      role: req.usuario.rol
    });
  } catch (error) {
    console.error("Error al obtener el paciente:", error);
    return res.status(500).render("error", {
      title: "Error",
      role: req.usuario.rol,
      message: "Error al obtener el paciente",
      error
    });
  }
};

//solo admin
const getPacientes = async (req, res) => {
  try {
    const pacientes = await pacienteService.getPacientes();
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//SOLO ADMINISTRADORES
const registrarPaciente = async (req, res) => {
  try {
    const { correo, ...pacienteData } = req.body;

    const nombreUsuario = `${pacienteData.nombre} ${pacienteData.apellido}`;

    const result = await pacienteService.registrarPaciente(
      { correo, ...pacienteData },
      nombreUsuario
    );

    await auditoriaService.crearAuditoria({
      tablaAfectada: "Paciente",
      registroId: result.pacienteId,
      operacion: "inserción",
      detalles: "Se registró un nuevo paciente",
      usuarioId: req.usuario.id
    });


    res.render("paciente/confirmacion", {
      role: req.usuario.rol,
      title: "Confirmación de creación",
      mensaje: "El paciente se ha creado correctamente.",
      usuarioId: result.usuarioId,
      pacienteId: result.pacienteId
    });
  } catch (error) {
    console.error("Error Error al registrar el paciente:", error);
    res.status(500).render("error", {
      role: req.usuario.rol,
      message: "Error al registrar el paciente.",
      error: error.message
    });
  }
};

const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const { correo, ...pacienteData } = req.body;

    const pacienteActualizado = await pacienteService.actualizarPaciente(
      id,
      pacienteData
    );

    // obtengo el usuario completo
    const usuario = await usuarioService.getUsuarioPorId(
      pacienteActualizado.usuarioId
    );

    await usuarioService.cambiarCorreo(usuario, correo);

    return res.render("paciente/confirmacion", {
      role: req.usuario.rol,
      title: "Confirmación de modificación",
      mensaje: "El paciente se ha modificado correctamente.",
      usuarioId: usuario.id,
      pacienteId: pacienteActualizado.id
    });
  } catch (error) {
    console.error("Ocurrió un error al modificar el paciente.", error);
    res.status(500).render("error", {
      role: req.usuario.rol,
      message: "Ocurrió un error al modificar el paciente.",
      error: error.message
    });
  }
};

//solo admin
const eliminarPaciente = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pacienteService.eliminarPaciente(id);
    res.json({ message: resultado.message });
  } catch (error) {
    console.error("Error al eliminar el paciente: ", error);
    res.status(500).render("error", {
      role: req.usuario.rol,
      message: "Error al eliminar el paciente.",
      error: error.message
    });
  }
};

const getHomePaciente = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const pacienteConOrdenes = await ordenTrabajoService.getOrdenesUsuarioId(usuarioId);
    const ordenes = pacienteConOrdenes.ordenesTrabajo;

    res.render("paciente/pacienteHome", {
      ordenes,
      role: req.usuario.rol,
      paciente:pacienteConOrdenes
    });
  } catch (error) {
    console.error("Error al obtener las ordenes del paciente: ", error);
    console.log("id del usuario: " + req.usuario.id);
    res.status(500).render("error", {
      message: "Hubo un error al obtener las ordenes del paciente.",
      role: req.usuario.rol,
      error: error.message
    });
  }
};

module.exports = {
  busquedaPaciente,
  registrarPaciente,
  getDni,
  actualizarPaciente,
  eliminarPaciente,
  getPacientes,
  getHomePaciente
};
