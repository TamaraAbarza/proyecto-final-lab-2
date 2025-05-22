const express = require('express');
const router = express.Router();
const detController = require('../controllers/determinacionController');
const { authenticateToken, authorizeRoles} = require('../middlewares/authMiddleware');

router.get('/crear', authenticateToken,authorizeRoles(["administrativo"]), detController.getForm);
router.post('/crear', authenticateToken,authorizeRoles(["administrativo"]), detController.crear);
router.get('/actualizar/:id', authenticateToken,authorizeRoles(["administrativo"]), detController.getForm);
router.post('/actualizar/:id', authenticateToken,authorizeRoles(["administrativo"]), detController.actualizar);
router.post('/eliminar/:id', authenticateToken,authorizeRoles(["administrativo"]), detController.eliminar);

module.exports = router;