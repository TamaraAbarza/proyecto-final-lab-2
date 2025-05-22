// middlewares/validarAcceso.js

// Middleware para validar el acceso a un recurso (Usuario o Paciente)
const validarAcceso =
  (modelo, rolesPermitidos = []) =>
  async (req, res, next) => {
    const { id } = req.params;
    const usuarioLogueado = req.usuario; // Extraído del token (usuario logueado)
    let recursoId = id ? parseInt(id) : usuarioLogueado.id;
    let puedeAcceder = false;

    // Si el usuario logueado intenta acceder a su propio recurso, permitir el acceso
    if (!id || parseInt(id) === usuarioLogueado.id) {
      puedeAcceder = true;
    }
    // Si se proporciona un ID y el rol del usuario logueado está permitido, permitir el acceso
    else if (id && rolesPermitidos.includes(usuarioLogueado.rol)) {
      puedeAcceder = true;
    }

    if (!puedeAcceder) {
      return res.status(403).json({
        message: `No tienes permisos para realizar esta acción`,
      });
    }

    // Buscar el recurso en la base de datos
    const recurso = await modelo.findByPk(recursoId, {
      attributes: { exclude: ["password"] } // Excluye la password
    });

    if (!recurso) {
      return res.status(404).json({ message: `${modelo.name} no encontrado.` });
    }

    // Adjuntar el recurso encontrado al request para que los controladores puedan acceder a él
    req[`${modelo.name.toLowerCase()}Accedido`] = recurso;
    next();
  };

module.exports = validarAcceso;