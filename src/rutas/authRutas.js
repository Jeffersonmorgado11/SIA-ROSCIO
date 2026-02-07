const express = require('express');
const router = express.Router();
const authControlador = require('../controladores/authControlador');
const auth = require('../middleware/autenticacion');

// @ruta    POST api/auth/registro
// @desc    Registrar usuario administrativo (validando cédula pre-autorizada)
// @acceso  Público
router.post('/registro', authControlador.registro);

// @ruta    POST api/auth/verificar-cedula
// @desc    Verificar si cédula está pre-autorizada
// @acceso  Público
router.post('/verificar-cedula', authControlador.verificarPreAutorizacion);

// @ruta    POST api/auth/solicitar-recuperacion
// @desc    Solicitar restablecimiento de contraseña
// @acceso  Público
router.post('/solicitar-recuperacion', authControlador.solicitarRecuperacion);
router.post('/cambiar-password', auth, authControlador.cambiarPassword);

// @ruta    POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @acceso  Público
router.post('/login', authControlador.login);

// @ruta    GET api/auth
// @desc    Obtener usuario autenticado
// @acceso  Privado
router.get('/', auth, authControlador.obtenerUsuario);

module.exports = router;
