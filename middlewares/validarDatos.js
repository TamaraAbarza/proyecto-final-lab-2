const { check, validationResult } = require('express-validator');

const validarLogin = [
  check('correo').notEmpty().withMessage('El email es obligatorio')
                 .isEmail().withMessage('Debe ser un email válido'),
  
  check('password').notEmpty().withMessage('La contraseña es obligatoria'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  }
];

const validarUsuario = [
  check('nombreUsuario')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3 }).withMessage('Debe tener al menos 3 caracteres'),
  check('correo')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido'),
  check('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('Debe tener al menos 6 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // En caso de error se renderiza la misma vista de creación con las notificaciones y errores
      return res.status(400).render("usuario/crearUsuario", {
        usuario: req.body,
        notifications: { error: "Por favor corrige los errores en el formulario" },
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualización de usuario desde admin (no requiere contraseña actual)
const validarActualizarUsuarioAdmin = [
  check('nombreUsuario')
    .optional()
    .isLength({ min: 3 })
    .withMessage('El nombre debe tener al menos 3 caracteres'),
  check('correo')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido'),
  check('nuevaPassword')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  check('rol')
    .optional()
    .isIn(["administrativo", "técnico", "bioquímico", "paciente"])
    .withMessage('Rol no válido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("usuario/modificarUsuarioAdmin", {
        usuario: req.body,
        notifications: { error: "Por favor corrige los errores en el formulario" },
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para actualización de usuario logueado (requiere contraseña actual)
const validarActualizarUsuarioLogueado = [
  check('correo')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido'),
  check('passwordActual')
    .notEmpty()
    .withMessage('Debes ingresar tu contraseña actual'),
  check('nuevaPassword')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  check('repetirNuevaPassword')
    .custom((value, { req }) => {
      if (req.body.nuevaPassword && value !== req.body.nuevaPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("usuario/modificarUsuario", {
        usuario: req.body,
        notifications: { error: "Por favor corrige los errores en el formulario" },
        errors: errors.array()
      });
    }
    next();
  }
];

const validarPaciente = [
  
  check('nombre').notEmpty().withMessage('El nombre es obligatorio')
                .isLength({ min: 3 }).withMessage('Debe tener al menos 3 caracteres'),
  
  check('apellido').notEmpty().withMessage('El apellido es obligatorio')
                   .isLength({ min: 3 }).withMessage('Debe tener al menos 3 caracteres'),

  check('dni').notEmpty().withMessage('El DNI es obligatorio')
              .isNumeric().withMessage('Debe ser un número')
              .isLength({ min: 7, max: 8 }).withMessage('Debe tener entre 7 y 8 dígitos'),

              check('fechaNacimiento').notEmpty().withMessage('La fecha de nacimiento es obligatoria')
              .isDate().withMessage('Formato inválido')
              .isBefore(new Date().toISOString()).withMessage('La fecha de nacimiento debe ser inferior o igual a la fecha actual'),

  check('genero').notEmpty().withMessage('El genero es obligatorio')
              .isIn(['M', 'F', 'O']).withMessage('Valor inválido'),

  check('telefono').optional().isMobilePhone().withMessage('Formato inválido'),

  check('direccion').optional().isLength({ min: 5 }).withMessage('Debe tener al menos 5 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  }
];

module.exports = {validarLogin, validarUsuario, validarPaciente, validarActualizarUsuarioLogueado, validarActualizarUsuarioAdmin};


/*
const validarNombre = [
  check('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3 }).withMessage('Debe tener al menos 3 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  }
];

const validarCorreo = [
  check('correo')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  }
];

const validarPassword = [
  // Se valida 'actualPassword' solo si el usuario logueado no es administrador.
  check('actualPassword')
    .if((value, { req }) => req.usuario?.rol !== 'administrativo')
    .notEmpty().withMessage('La contraseña actual es obligatoria'),

  check('nuevaPassword')
    .notEmpty().withMessage('La contraseña nueva es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña nueva debe tener al menos 6 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  }
];

const validarDni = [
  check('dni').notEmpty().withMessage('El DNI es obligatorio')
  .isNumeric().withMessage('Debe ser un número')
  .isLength({ min: 7, max: 8 }).withMessage('Debe tener entre 7 y 8 dígitos'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  }
];*/