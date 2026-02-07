const express = require('express');
const router = express.Router();
const inventarioControlador = require('../controladores/inventarioControlador');
const auth = require('../middleware/autenticacion');

// Middleware para verificar rol (admin o administrativo)
const esPersonalComedor = (req, res, next) => {
    if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'administrativo') {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
    }
    next();
};

router.use(auth); // Todas las rutas requieren login
router.use(esPersonalComedor); // Todas las rutas requieren ser admin o administrativo

router.get('/productos', inventarioControlador.obtenerProductos);
router.post('/productos', inventarioControlador.crearProducto);
router.delete('/productos/:id', inventarioControlador.eliminarProducto);

router.post('/movimientos', inventarioControlador.registrarMovimiento);
router.get('/movimientos', inventarioControlador.obtenerMovimientos);

module.exports = router;
