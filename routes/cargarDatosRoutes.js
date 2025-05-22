const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles} = require('../middlewares/authMiddleware');

const cdController = require('../controllers/cargarDatosController');

router.get('/', authenticateToken,authorizeRoles(["administrativo"]), cdController.listar);

module.exports = router;