const express = require('express');
const router = express.Router();
const diaFestivoControlador = require('../controladores/diaFestivoControlador');
const auth = require('../middleware/autenticacion');

// Proteger rutas (solo admin/administrativo debería poder cambiar esto)
router.use(auth);

router.get('/', diaFestivoControlador.obtenerFestivos);
router.post('/', diaFestivoControlador.toggleFestivo);

module.exports = router;
