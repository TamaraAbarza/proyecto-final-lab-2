"use strict";

// routes/muestraRoutes.js
var express = require("express");

var router = express.Router();

var _require = require("../controllers/muestraController"),
    getCrearMuestra = _require.getCrearMuestra,
    crearMuestra = _require.crearMuestra,
    generarEtiquetaPDF = _require.generarEtiquetaPDF;

var _require2 = require('../middlewares/authMiddleware'),
    authenticateToken = _require2.authenticateToken,
    authorizeRoles = _require2.authorizeRoles; // Ruta para acceder a la vista de form de registro de muestra para una orden específica


router.get('/:ordenId/crear', authenticateToken, authorizeRoles(['administrativo', 'técnico']), getCrearMuestra); // Procesar creación de muestra

router.post('/:ordenId/crear', authenticateToken, authorizeRoles(['administrativo', 'técnico']), crearMuestra); // Generar PDF de la etiqueta

router.get('/:ordenId/etiqueta', generarEtiquetaPDF);
module.exports = router;