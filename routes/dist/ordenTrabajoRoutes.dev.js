"use strict";

// routes/ordenRoutes.js
var express = require('express');

var router = express.Router();

var ordenController = require('../controllers/ordenTrabajoController');

var _require = require('../middlewares/authMiddleware'),
    authenticateToken = _require.authenticateToken,
    authorizeRoles = _require.authorizeRoles; // Rutas para crear una orden de trabajo


router.get('/crear/:pacienteId', authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico']), ordenController.getCrearOrden);
router.post('/crear', authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico']), ordenController.crearOrden); // actualizar orden - solo si estado es 'esperando toma de muestra'

router.get('/:ordenId/actualizar', authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico']), ordenController.getActualizarOrden);
router.post('/:ordenId/actualizar', authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico']), ordenController.actualizarOrden); // Eliminar orden (solo si estado es 'esperando toma de muestra')

router["delete"]('/:ordenId', authenticateToken, authorizeRoles(['administrativo', 'técnico', 'bioquímico']), ordenController.eliminarOrden); //ordenes pendientes de registro de muestras 

router.get('/pendientes/muestras', authenticateToken, authorizeRoles(['administrativo', 'técnico']), ordenController.getOrdenesPendientes); // Ruta para listar todas las órdenes

router.get('/all', authenticateToken, authorizeRoles(['administrativo', 'técnico']), ordenController.getAllOrdenes); //historial de estados de órdenes

router.get('/historial', authenticateToken, authorizeRoles(['administrativo']), ordenController.getHistorialEstados);
/*
//const { getValidacion, postValidacion, getOrdenesParaValidar } = require('../controllers/validacionController');
//const validacionController = require('../controllers/validacionController');
//const { getPreInforme, postPreInforme, postPreInformeConfirmacion, getPreInformeFinal, editPreInforme} = require('../controllers/examenController');


//PRE INFORME - TÉCNICO
// Solo técnicos pueden realizar pre informe 

router.get('/:ordenId/detalle', authenticateToken, authorizeRoles(['administrativo', 'técnico']),ordenController.getOrdenDetalle);

// Ruta para mostrar el formulario del preinforme
router.get('/examen/:ordenExamenId/preinforme', authenticateToken, authorizeRoles(['administrativo','técnico']), getPreInforme);
// Ruta para procesar el formulario del preinforme
router.post('/examen/:ordenExamenId/preinforme', authenticateToken, authorizeRoles(['administrativo', 'técnico']), postPreInforme);
// Ruta para procesar la confirmación cuando hay avisos
router.post('/examen/:ordenExamenId/preinforme/confirmacion', authenticateToken, authorizeRoles(['administrativo', 'técnico']), postPreInformeConfirmacion);

// Permite volver al formulario de preinforme para modificar los valores (con datos precargados)
router.post('/examen/:ordenExamenId/preinforme/editar', authenticateToken, authorizeRoles(['administrativo', 'técnico']), editPreInforme);

// Ruta para mostrar la vista final de confirmación
router.get('/examen/:ordenExamenId/preinforme/final', authenticateToken, authorizeRoles(['administrativo', 'técnico']), getPreInformeFinal);

//VALIDACION - BIOQUÍMICO - Sólo se permite el acceso a usuarios con rol "bioquímico"

router.get('/validacion/lista', authenticateToken, authorizeRoles(['administrativo', 'bioquímico']), getOrdenesParaValidar);

// Visualizar la orden completa
router.get('/examen/:ordenExamenId/validacion', authenticateToken, authorizeRoles(['administrativo', 'bioquímico']), validacionController.obtenerOrdenCompleta);

// Cambiar estado a "informada" (validar)
router.post("/examen/:ordenExamenId/validar", authenticateToken, authorizeRoles(['administrativo', 'bioquímico']), validacionController.validarOrden);

// Cambiar estado a "analítica" (no validar)
router.post("/examen/:ordenExamenId/no-validar", authenticateToken, authorizeRoles(['administrativo', 'bioquímico']), validacionController.noValidarOrden);

// Generar PDF del informe (solo si la orden está validada)
router.get("/examen/:ordenExamenId/pdf", authenticateToken, validacionController.generarPDFOrden);


const ordenHistoryController = require("../controllers/ordenHistoryController");

router.get("/all", authenticateToken, authorizeRoles(['administrativo', 'bioquímico']), ordenHistoryController.getHistorial);
router.get("/detalles/:id",  authenticateToken, authorizeRoles(['administrativo', 'bioquímico']), ordenHistoryController.getOrdenDetalles);

// Nuevos endpoints para descarga de PDFs:
router.get("/descargarEtiqueta/:ordenId",  authenticateToken, authorizeRoles(['administrativo', 'bioquímico']), ordenHistoryController.descargarEtiqueta);
router.get("/descargarInforme/:ordenExamenId", authenticateToken, ordenHistoryController.descargarInforme);
*/

module.exports = router;