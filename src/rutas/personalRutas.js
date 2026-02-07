const express = require('express');
const router = express.Router();
const personalControlador = require('../controladores/personalControlador');
const auth = require('../middleware/autenticacion');

// Middleware roles
const esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') return res.status(403).json({ mensaje: 'Requiere rol Admin' });
    next();
};

const esAdministrativo = (req, res, next) => {
    if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'administrativo') {
        return res.status(403).json({ mensaje: 'Requiere rol Administrativo' });
    }
    next();
};

router.use(auth);

// --- RUTAS DE PRE-AUTORIZACIÓN (Solo Admin) ---
router.post('/pre-autorizar', esAdmin, personalControlador.crearPreAutorizado);
router.get('/pre-autorizados', esAdmin, personalControlador.obtenerPreAutorizados);
router.delete('/pre-autorizados/:id', esAdmin, personalControlador.eliminarPreAutorizado);

// --- RUTAS DE OBREROS (Admin y Administrativo) ---
router.post('/obreros', esAdministrativo, personalControlador.crearObrero);
router.get('/obreros', esAdministrativo, personalControlador.obtenerObreros);
router.put('/obreros/:id', esAdministrativo, personalControlador.actualizarObrero);
router.delete('/obreros/:id', esAdministrativo, personalControlador.eliminarObrero);


// --- RUTAS DE USUARIOS SISTEMA (Solo Admin) ---
router.get('/usuarios-sistema', esAdmin, personalControlador.obtenerUsuariosSistema);
router.delete('/usuarios-sistema/:id', esAdmin, personalControlador.eliminarUsuarioSistema);


module.exports = router;
