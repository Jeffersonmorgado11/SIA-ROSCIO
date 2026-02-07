const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/usuarioControlador');
const auth = require('../middleware/autenticacion');

// Middleware para verificar si es admin
const esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado. Se requiere rol de administrador' });
    }
    next();
};

// Rutas protegidas (Auth + Admin)
// Nuevas rutas de gestión de contraseñas (Deben ir ANTES de /:id)
router.get('/solicitudes/pendientes', [auth, esAdmin], usuarioControlador.obtenerSolicitudes);
router.get('/solicitudes/historial', [auth, esAdmin], usuarioControlador.obtenerHistorialSolicitudes);
router.post('/restablecer-password', [auth, esAdmin], usuarioControlador.restablecerPassword);

// Rutas protegidas (Auth + Admin)
router.get('/', [auth, esAdmin], usuarioControlador.obtenerUsuarios);
router.post('/', [auth, esAdmin], usuarioControlador.crearUsuario);
router.put('/:id', [auth, esAdmin], usuarioControlador.actualizarUsuario);
router.delete('/:id', [auth, esAdmin], usuarioControlador.eliminarUsuario);

module.exports = router;
