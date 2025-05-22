const express = require('express');
const router = express.Router();
const examenController = require('../controllers/examenController');
const { authenticateToken, authorizeRoles} = require('../middlewares/authMiddleware');

router.get('/crear',  authenticateToken,authorizeRoles(["administrativo"]), examenController.getForm);
router.post('/crear',  authenticateToken,authorizeRoles(["administrativo"]), examenController.crear);
router.get('/actualizar/:id',  authenticateToken,authorizeRoles(["administrativo"]), examenController.getForm);
router.post('/actualizar/:id',  authenticateToken,authorizeRoles(["administrativo"]),  examenController.actualizar);
router.post('/eliminar/:id', authenticateToken,authorizeRoles(["administrativo"]),  examenController.eliminar);

//para pre informe - técnico 
//router.get('/:examenId/preinforme', authenticateToken, authorizeRoles(['administrativo', 'técnico']),examenController.getRegistrarResultado);
router.get('/:ordenId/:examenId/preinforme', authenticateToken, authorizeRoles(['administrativo', 'técnico']),examenController.getRegistrarResultado);
router.post('/:examenId/preinforme', authenticateToken, authorizeRoles(['administrativo', 'técnico']),examenController.registrarResultado);

//modificar
router.get('/:ordenId/:examenId/preinforme/actualizar', authenticateToken, authorizeRoles(['administrativo', 'técnico']),examenController.getActualizarResultado);
router.post('/:ordenId/:examenId/preinforme/actualizar', authenticateToken, authorizeRoles(['administrativo', 'técnico']),examenController.actualizarResultado);



//para validar - bioquimico
router.get('/:examenId/validacion/lista', authenticateToken, authorizeRoles(['administrativo', 'bioquímico']),examenController.getRegistrarResultado);
router.get('/:ordenId/validar', authenticateToken, authorizeRoles(['administrativo', 'bioquímico']),examenController.getValidarResultados);
router.post('/:ordenId/validar', authenticateToken, authorizeRoles(['administrativo', 'bioquímico']),examenController.validarResultados);
router.get('/:ordenId/actualizar', authenticateToken, authorizeRoles(['administrativo', 'bioquímico']),examenController.getActualizarValidacion);

//descargar informe
router.get('/:ordenId/informe',authenticateToken, examenController.informeResultados);

module.exports = router;
