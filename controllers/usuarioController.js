const Usuario = require("../models/usuario");
const usuarioService = require("../services/usuarioService");
const auditoriaService = require("../services/auditoriaService");

//para la vista

const vistaHome = async (req, res) => {
  try {
    res.render("empleado/empleadoHome", {
      title: "Home",
      role: req.usuario.rol
    });
  } catch (error) {
    res.status(500).render("error", {
      role: req.usuario.rol,
      mensaje: "Ocurrió un error"
    });
  }
};

const vistaListaUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.getUsuarios();
    res.render("usuario/listaUsuarios", {
      usuarios,
      role: req.usuario.rol
    });
  } catch (error) {
    console.log("--------------------------------------");
    console.log("Error listado de usuarios: " + error);
    res.status(500).render("error", {
      role: req.usuario.rol,
      mensaje: "Ocurrió un error al obtener la lista de usuarios."
    });
  }
};

const vistaCrearUsuario = (req, res) => {
  try {
    res.render("usuario/crearUsuario", {
      notifications: {},
      errors: [],
      role: req.usuario.rol
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      role: req.usuario.rol,
      mensaje: "Ocurrió un error al cargar la vista de creación de usuario."
    });
  }
};

const vistaModificarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).render("error", {
        mensaje: "Usuario no encontrado.",
        role: req.usuario.rol
      });
    }
    res.render("usuario/modificarUsuarioAdmin", {
      usuario,
      notifications: {},
      errors: [],
      role: req.usuario.rol
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      role: req.usuario.rol,
      mensaje: "Ocurrió un error al cargar la vista de edición del usuario."
    });
  }
};

const vistaActualizarUsuarioLogueado = async (req, res) => {
  try {
    const usuarioLogueadoId = req.usuario.id;
    const usuario = await Usuario.findByPk(usuarioLogueadoId);
    if (!usuario) {
      return res.status(404).render("error", {
        role: req.usuario.rol,
        mensaje: "Usuario no encontrado."
      });
    }
    res.render("usuario/modificarUsuario", {
      role: req.usuario.rol,
      usuario,
      notifications: {},
      errors: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      role: req.usuario.rol,
      mensaje:
        "Ocurrió un error al cargar la vista de actualización del perfil."
    });
  }
};
const actualizarUsuarioLogueado = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { correo, passwordActual, nuevaPassword, repetirNuevaPassword } =
      req.body;
    const datos = {
      correo,
      passwordActual,
      nuevaPassword,
      repetirNuevaPassword
    };

    // Actualiza validando la contraseña actual
    const usuarioActualizado = await usuarioService.actualizarUsuarioLogueado(
      usuarioId,
      datos
    );
    res.render("usuario/modificarUsuario", {
      role: req.usuario.rol,
      usuario: usuarioActualizado,
      notifications: { success: "Perfil actualizado correctamente" },
      errors: []
    });
  } catch (error) {
    res.status(500).render("usuario/modificarUsuario", {
      role: req.usuario.rol,
      usuario: req.body,
      notifications: {
        error: "Error al actualizar tu perfil. " + error.message
      },
      errors: []
    });
  }
};

//para admin
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreUsuario, correo, rol, nuevaPassword } = req.body;
    const datos = { nombreUsuario, correo, rol, nuevaPassword };
    const adminUserId = req.usuario.id;

    // Actualiza sin requerir la contraseña actual
    const usuarioActualizado = await usuarioService.actualizarUsuario(
      id,
      datos,
      adminUserId
    );

    /*
    await auditoriaService.crearAuditoria({
      tablaAfectada: "Usuario",
      registroId: id,
      operacion: "actualización",
      detalles: "Se actualizó el usuario",
      usuarioId: req.usuario.id
    });*/

    res.redirect("/usuario/all");
  } catch (error) {
    res.status(500).render("usuario/modificarUsuarioAdmin", {
      role: req.usuario.rol,
      usuario: req.body,
      notifications: {
        error: "Error al actualizar el perfil. " + error.message
      },
      errors: []
    });
  }
};

//PARA TRABAJADORES DONDE SE PUEDE ASIGNAR ROLES - SOLO ADMINISTRADORES
const crearUsuario = async (req, res) => {
  try {
    const { correo, password, rol, nombreUsuario } = req.body;
    const usuarioLogueadoId = req.usuario.id; // Id del usuario logueado

    const usuario = await usuarioService.crearUsuario(
      correo,
      password,
      rol,
      nombreUsuario,
      usuarioLogueadoId
    );

    await auditoriaService.crearAuditoria({
      tablaAfectada: "Usuario",
      registroId: usuario.id,
      operacion: "inserción",
      detalles: "Se registró un nuevo usuario",
      usuarioId: req.usuario.id
    });

    res.redirect("/usuario/all");
  } catch (error) {
    res.status(500).render("usuario/crearUsuario", {
      role: req.usuario.rol,
      usuario: req.body,
      notifications: { error: "Error al crear el usuario. " + error.message },
      errors: []
    });
  }
};

//para admin
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioLogueadoId = req.usuario.id; // Id del usuario logueado

    await usuarioService.eliminarUsuario(id, usuarioLogueadoId);
    
    await auditoriaService.crearAuditoria({
      tablaAfectada: "Usuario",
      registroId: id,
      operacion: "eliminación",
      detalles: "Se elimino el usuario",
      usuarioId: req.usuario.id
    });

    res.status(200).json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).render("error", {
      role: req.usuario.rol,
      message: "Error al eliminar el usuario.",
      error: error.message
    });
  }
};

module.exports = {
  crearUsuario,
  eliminarUsuario,
  mostrarListaUsuarios: vistaListaUsuarios,
  mostrarCrearUsuario: vistaCrearUsuario,
  mostrarModificarUsuario: vistaModificarUsuario,
  actualizarUsuario,
  mostrarActualizarUsuarioLogueado: vistaActualizarUsuarioLogueado,
  actualizarUsuarioLogueado,
  vistaHome
};
