const express = require('express');
const router = express.Router();
const { authenticateToken, verificarAutenticado} = require('../middlewares/authMiddleware');
const {validarLogin} = require('../middlewares/validarDatos'); // Middleware de validación paciente y usuario
const { login, logout, vistaFormEmpleado, vistaFormPaciente} = require('../controllers/authController');//metodo login del controlador de usuario

//renderizar vistas
router.get("/login/empleado", verificarAutenticado, vistaFormEmpleado);

router.get("/login/paciente", verificarAutenticado, vistaFormPaciente);

//iniciar sesion
router.post('/login', validarLogin, login); 
//cerrar sesion
router.get('/logout',authenticateToken, logout);


/*
//para cambio de contraseña por mail
//solicita via mail
router.post('/request-password-reset', requestPasswordReset);
//cambia la contraseña 
router.post('/restablecer-password', restablecerPassword);

*/

module.exports = router;
  

