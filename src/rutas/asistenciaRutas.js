const express = require('express');
const router = express.Router();
const asistenciaControlador = require('../controladores/asistenciaControlador');
const auth = require('../middleware/autenticacion');

router.use(auth);

// Rutas para admin y administrativo
router.post('/', asistenciaControlador.registrarAsistencia); // Enviar { cedula, tipo }
router.get('/reporte', asistenciaControlador.obtenerReporteAsistencias);

module.exports = router;
