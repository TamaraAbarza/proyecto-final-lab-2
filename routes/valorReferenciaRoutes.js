const express = require('express');
const router = express.Router();
const valController = require('../controllers/valorReferenciaController');
const { authenticateToken, authorizeRoles} = require('../middlewares/authMiddleware');

router.get('/crear', authenticateToken,authorizeRoles(["administrativo"]), valController.getForm);
router.post('/crear', authenticateToken,authorizeRoles(["administrativo"]), valController.crear);
router.get('/actualizar/:id', authenticateToken,authorizeRoles(["administrativo"]), valController.getForm);
router.post('/actualizar/:id', authenticateToken,authorizeRoles(["administrativo"]), valController.actualizar);
router.post('/eliminar/:id', authenticateToken,authorizeRoles(["administrativo"]), valController.eliminar);

module.exports = router;