// routes/ordenRoutes.js
const express = require('express');
const router = express.Router();
const ordenController = require('../controllers/ordenTrabajoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Rutas para crear una orden de trabajo
router.get('/crear/:pacienteId',authenticateToken,authorizeRoles(['administrativo', 'técnico', 'bioquímico', 'recepcionista']), ordenController.getCrearOrden);
router.post('/crear',authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico' ]), ordenController.crearOrden);

// actualizar orden - solo si estado es 'esperando toma de muestra'
router.get('/:ordenId/actualizar',  authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico' , 'recepcionista']), ordenController.getActualizarOrden);
router.post('/:ordenId/actualizar', authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico', , 'recepcionista' ]), ordenController.actualizarOrden);

// Eliminar orden (solo si estado es 'esperando toma de muestra')
router.delete('/:ordenId', authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico', 'recepcionista' ]), ordenController.eliminarOrden);

//ordenes pendientes de registro de muestras 
router.get('/pendientes/muestras', authenticateToken, authorizeRoles(['administrativo', 'técnico', 'recepcionista']),ordenController.getOrdenesPendientes);

// Ruta para listar todas las órdenes
router.get('/all', authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico', 'recepcionista']), ordenController.getAllOrdenes);
//historial de estados de órdenes
router.get('/historial',  authenticateToken, authorizeRoles(['administrativo']), ordenController.getHistorialEstados);

//PRE INFORME - TÉCNICO
// Solo técnicos pueden realizar pre informe 
router.get('/preinforme', authenticateToken, authorizeRoles(['administrativo', 'técnico']), ordenController.getOrdenesPreInforme);
router.get('/:ordenId/detalle', authenticateToken, authorizeRoles(['administrativo', 'técnico']),ordenController.getOrdenDetalle);


//VALIDACION - BIOQUÍMICO - Sólo se permite el acceso a usuarios con rol "bioquímico"
router.get('/validacion/lista', authenticateToken, authorizeRoles(['administrativo', 'bioquímico']), ordenController.getOrdenesValidar);


module.exports = router;

