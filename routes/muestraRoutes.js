// routes/muestraRoutes.js

const express = require("express");
const router = express.Router();
const { getCrearMuestra, crearMuestra, generarEtiquetaPDF , cambiarEstado, getMuestrasRegistradas, reimprimirEtiqueta  } = require("../controllers/muestraController");
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/:ordenId/crear',authenticateToken, authorizeRoles(['administrativo', 'técnico']), getCrearMuestra);
router.post('/:ordenId/crear',authenticateToken, authorizeRoles(['administrativo', 'técnico']), crearMuestra);

router.post('/:id/procesar', authenticateToken, authorizeRoles(['administrativo', 'técnico']), cambiarEstado);

// Generar PDF de la etiqueta
router.get('/:ordenId/etiqueta', authenticateToken, authorizeRoles(['administrativo', 'técnico']), generarEtiquetaPDF);

// Mostrar las muestras registradas
router.get('/:ordenId/registradas', authenticateToken, authorizeRoles(['administrativo', 'técnico']), getMuestrasRegistradas);

// Reimprimir la etiqueta de una muestra
router.get('/:muestraId/reimprimir',  authenticateToken, authorizeRoles(['administrativo', 'técnico']), reimprimirEtiqueta);


module.exports = router;