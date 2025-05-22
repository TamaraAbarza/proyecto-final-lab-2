const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles} = require('../middlewares/authMiddleware');

const {vistaHome, crearUsuario, mostrarModificarUsuario, eliminarUsuario, actualizarUsuario, mostrarListaUsuarios, mostrarCrearUsuario,
  mostrarActualizarUsuarioLogueado, actualizarUsuarioLogueado
} = require('../controllers/usuarioController');

const {validarUsuario, validarActualizarUsuarioLogueado, validarActualizarUsuarioAdmin} = require('../middlewares/validarDatos'); // Middleware de validación paciente y usuario


// Ruta para mostrar vista Home de empleado
router.get("/home", authenticateToken, vistaHome);

// Ruta para mostrar la lista de usuarios (solo para administradores)
router.get('/all', authenticateToken, authorizeRoles(['administrativo']), mostrarListaUsuarios);

//Ruta para renderizar la vista de crear usuario
router.get('/crear', authenticateToken, authorizeRoles(['administrativo']), mostrarCrearUsuario);
//Ruta para renderizar la vista de actualizar usuario
router.get('/actualizar/:id', authenticateToken, authorizeRoles(['administrativo']), mostrarModificarUsuario);
router.put('/actualizar/:id',authenticateToken, authorizeRoles(['administrativo']), validarActualizarUsuarioAdmin, actualizarUsuario); //actualizar usuario

// Ruta para crear un nuevo usuario - empleado
router.post('/crear',authenticateToken,authorizeRoles(["administrativo"]),validarUsuario, crearUsuario);
router.delete('/:id', authenticateToken,authorizeRoles(["administrativo"]), eliminarUsuario); //eliminar usuario

// Ruta para mostrar el formulario de actualización del perfil (usuario logueado)
router.get('/perfil', authenticateToken, mostrarActualizarUsuarioLogueado);

// Ruta para procesar la actualización del perfil
router.post('/perfil', authenticateToken, validarActualizarUsuarioLogueado, actualizarUsuarioLogueado);


module.exports = router;