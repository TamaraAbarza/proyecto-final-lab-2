// services/usuarioService.js
const {Usuario, sequelize} = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const auditoriaService = require("../services/auditoriaService");

const getUsuarioPorId = async (id) => {
  return await Usuario.findByPk(id, {
    attributes: { exclude: ["password"] }
  });
};



const getUsuarios = async () => {
  return await Usuario.findAll({
    attributes: { exclude: ['password'] },
    order: [
      ['estado', 'DESC'],

      //Orden personalizado de roles: administrativo → técnico → bioquímico → paciente
      [
        sequelize.literal(
          `FIELD(rol, 'administrativo', 'técnico', 'bioquímico', 'paciente')`
        ),
        'ASC'
      ]
    ]
  });
};

const getUsuarioPorcorreo = async (correo) => {
  return await Usuario.findOne({ where: { correo } });
};

const crearUsuario = async (correo, password, rol, nombreUsuario, usuarioLogueadoId) => {
  const usuarioExistente = await Usuario.findOne({ where: { correo } });
  if (usuarioExistente) {
    throw new Error("El correo ingresado ya está en uso por otro usuario.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({
    nombreUsuario,
    correo,
    password: hashedPassword,
    rol
  });

  /*
  // Registrar en auditoría
  await auditoriaService.crearRegistroAuditoria(
    "usuarios",
    usuario.id,
    "creación",
    `Usuario creado: ${JSON.stringify(usuario)}`,
    usuarioLogueadoId
  );
  */

  return usuario;
};

const eliminarUsuario = async (usuarioId, usuarioLogueadoId) => {
  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario) {
    throw new Error("Usuario no encontrado.");
  }

  // Impedir que un usuario se elimine a sí mismo
  if (usuarioLogueadoId === usuario.id) {
    throw new Error("No puedes eliminar tu propia cuenta.");
  }

  // Verificar que siempre haya al menos un usuario administrativo
  if (usuario.rol === "administrativo") {
    const countAdmins = await Usuario.count({
      where: { rol: "administrativo" }
    });
    if (countAdmins <= 1) {
      throw new Error("Debe haber al menos un administrador en el sistema.");
    }
  }

  // Actualizar el estado del usuario a "inactivo" en lugar de eliminarlo
  usuario.estado = false;
  await usuario.save();

  /*
  // Registrar el cambio de estado en la auditoría
  await auditoriaService.crearRegistroAuditoria(
    "usuarios", // tabla afectada
    usuario.id, // id del registro afectado
    "eliminacion", // operación realizada (puedes ajustar el nombre según tu convención)
    "Cambio de estado a inactivo", // detalle del cambio
    usuarioLogueadoId // id del usuario que realizó la acción
  );*/
};

const cambiarCorreo = async (usuario, correoNuevo) => {
  // Si el correo se cambio, verificar si ya está en uso por otro usuario
  if (correoNuevo && correoNuevo !== usuario.correo) {
    const usuarioEncontrado = await Usuario.findOne({
      where: {
        correo: correoNuevo,
        id: { [Op.ne]: usuario.id }
      }
    });

    if (usuarioEncontrado) {
      throw new Error("El correo ingresado ya está en uso por otro usuario.");
    }

    usuario.correo = correoNuevo;
  }

  await usuario.save();
};

const actualizarUsuario = async (usuarioId, datos, usuarioLogueadoId) => {
  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // Inicializar objeto con cambios
  let cambios = {};

  // Validar y asignar nuevo nombre de usuario
  if (datos.nombreUsuario && datos.nombreUsuario !== usuario.nombreUsuario) {
    cambios.nombreUsuario = datos.nombreUsuario;
  }

  // Validar y actualizar correo
  if (datos.correo && datos.correo !== usuario.correo) {
    // Verificar que el nuevo correo no esté en uso por otro usuario
    const usuarioExistente = await Usuario.findOne({
      where: {
        correo: datos.correo,
        id: { [Op.ne]: usuarioId }
      }
    });
    if (usuarioExistente) {
      throw new Error("El correo ingresado ya está en uso por otro usuario.");
    }
    cambios.correo = datos.correo;
  }

  // Validar y actualizar contraseña
  if (datos.nuevaPassword && datos.nuevaPassword.trim() !== "") {
    const hashedPassword = await bcrypt.hash(datos.nuevaPassword, 10);
    cambios.password = hashedPassword;
  }

  // Validar y actualizar rol
  if (datos.rol && datos.rol !== usuario.rol) {
    const rolesPermitidos = ["administrativo", "técnico", "bioquímico", "paciente"];
    if (!rolesPermitidos.includes(datos.rol)) {
      throw new Error("Rol no válido.");
    }
    cambios.rol = datos.rol;
  }

  // Si no se realizaron cambios, se retorna el usuario sin modificar
  if (Object.keys(cambios).length === 0) {
    return usuario;
  }

  // Iniciar transacción para garantizar la consistencia
  const t = await sequelize.transaction();
  try {
    await usuario.update(cambios, { transaction: t });
    await t.commit();

    // Registrar auditoría solo si hubo cambios
    await auditoriaService.crearRegistroAuditoria(
      "usuarios",
      usuarioId,
      "Modificación",
      "Usuario modificado",
      usuarioLogueadoId
    );

    return usuario;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const actualizarUsuarioLogueado = async (usuarioId, datos) => {
  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // Verificar que se haya enviado la contraseña actual
  if (!datos.passwordActual || datos.passwordActual.trim() === "") {
    throw new Error("Debes ingresar tu contraseña actual.");
  }

  // Comparar la contraseña actual proporcionada con la almacenada
  const esPasswordValida = await bcrypt.compare(datos.passwordActual, usuario.password);
  if (!esPasswordValida) {
    throw new Error("La contraseña actual es incorrecta.");
  }

  let cambios = {};

  // Actualizar correo si se modificó
  if (datos.correo && datos.correo !== usuario.correo) {
    // Verificar que el nuevo correo no esté en uso por otro usuario
    const usuarioExistente = await Usuario.findOne({
      where: {
        correo: datos.correo,
        id: { [Op.ne]: usuarioId }
      }
    });
    if (usuarioExistente) {
      throw new Error("El correo ingresado ya está en uso por otro usuario.");
    }
    cambios.correo = datos.correo;
  }

  // Actualizar contraseña si se provee la nueva y la confirmación
  if (datos.nuevaPassword || datos.repetirNuevaPassword) {
    if (datos.nuevaPassword !== datos.repetirNuevaPassword) {
      throw new Error("La nueva contraseña y su confirmación no coinciden.");
    }
    if (datos.nuevaPassword.trim() === "") {
      throw new Error("La nueva contraseña no puede estar vacía.");
    }
    const hashedPassword = await bcrypt.hash(datos.nuevaPassword, 10);
    cambios.password = hashedPassword;
  }

  // Si no hay cambios, retornamos el usuario actual
  if (Object.keys(cambios).length === 0) {
    return usuario;
  }

  // Actualización en una transacción para asegurar consistencia
  const t = await sequelize.transaction();
  try {
    await usuario.update(cambios, { transaction: t });
    await t.commit();

    /*
    // Registrar auditoría si se realizó algún cambio
    await auditoriaService.crearRegistroAuditoria(
      "usuarios",
      usuarioId,
      "Modificación",
      "Usuario logueado actualizó correo y/o contraseña",
      usuarioId
    );*/

    return usuario;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const cambiarPassword = async (usuario, nuevaContraseña) => {
  const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
  usuario.password = hashedPassword;
  await usuario.save();
};

const actualizarRol = async (usuarioId, rol, usuarioLogueadoId) => {
  try {
    const rolesPermitidos = [
      "administrativo",
      "técnico",
      "bioquímico",
      "paciente"
    ];
    if (!rolesPermitidos.includes(rol)) {
      throw new Error("Rol no válido.");
    }

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }
    usuario.rol = rol;
    await usuario.save();
    return usuario;
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    throw error;
  }
};


module.exports = {
  getUsuarioPorId,
  getUsuarios,
  getUsuarioPorcorreo,
  crearUsuario,
  eliminarUsuario,
  cambiarCorreo,
  cambiarPassword,
  actualizarRol,
  actualizarUsuario,
  actualizarUsuarioLogueado,
};
