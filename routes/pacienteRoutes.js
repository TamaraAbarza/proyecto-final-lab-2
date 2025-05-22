const express = require('express');
const Paciente = require('../models/paciente');
const router = express.Router();

const {busquedaPaciente , getHomePaciente, getDni, actualizarPaciente, eliminarPaciente, getPacientes, getPaciente, registrarPaciente } = require('../controllers/pacienteController');
//Middlewares
const { authenticateToken, authorizeRoles} = require('../middlewares/authMiddleware');
const validarAcceso = require('../middlewares/validarAcceso'); // Middleware de validación de acceso
const {validarPaciente} = require('../middlewares/validarDatos'); // Middleware de validación paciente y usuario

// Ruta para mostrar vista Home de paciente logueado
router.get("/home", authenticateToken,authorizeRoles(["paciente"]),  getHomePaciente);

//obtener todos
router.get('/all',authenticateToken,authorizeRoles(["administrativo"]), getPacientes);
//vista para buscar paciente
router.get('/busqueda',authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico', 'recepcionista']), busquedaPaciente )
// Ruta para buscar un paciente por DNI 
router.get('/', authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico', 'recepcionista']), getDni);


//Ruta para registrarPaciente y su usuario
router.post('/',authenticateToken,authorizeRoles(['administrativo', 'técnico', 'bioquímico', 'recepcionista']),validarPaciente, registrarPaciente);
//actualizar
router.put('/:id', authenticateToken, validarAcceso(Paciente,['administrativo', 'técnico', 'bioquímico', 'recepcionista']), validarPaciente, actualizarPaciente);
//eliminar
router.delete('/:id', authenticateToken,authorizeRoles(["administrativo"]), eliminarPaciente);
module.exports = router;