/* ---|| DEPENDENCIAS & MODELOS ||--- */
const Usuario = require('../modelos/Usuario');
const PreAutorizado = require('../modelos/PreAutorizado');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* ---|| VERIFICACION DE PRE-AUTORIZACION ||--- */
exports.verificarPreAutorizacion = async (req, res) => {
    try {
        const { cedula } = req.body;
        const preAuth = await PreAutorizado.findOne({ cedula });

        if (!preAuth) {
            return res.status(404).json({ mensaje: 'Cédula no pre-autorizada.' });
        }
        if (preAuth.registrado) {
            return res.status(400).json({ mensaje: 'El usuario ya ha completado su registro.' });
        }

        res.json({
            mensaje: 'Cédula válida',
            datos: {
                nombre: preAuth.nombre,
                apellido: preAuth.apellido,
                cargo: preAuth.cargo
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al verificar cédula' });
    }
};

/* ---|| REGISTRO DE USUARIO ||--- */
exports.registro = async (req, res) => {
    try {
        const { cedula, email, password } = req.body;

        const preAuth = await PreAutorizado.findOne({ cedula });
        if (!preAuth) {
            return res.status(403).json({ mensaje: 'No autorizado.' });
        }
        if (preAuth.registrado) {
            return res.status(400).json({ mensaje: 'Usuario ya registrado.' });
        }

        let usuario = await Usuario.findOne({ email });
        if (usuario) {
            return res.status(400).json({ mensaje: 'El email ya está uso' });
        }

        usuario = new Usuario({
            nombre: `${preAuth.nombre} ${preAuth.apellido}`,
            email,
            password,
            rol: 'administrativo',
            cedula
        });

        await usuario.save();

        preAuth.registrado = true;
        await preAuth.save();

        const payload = {
            usuario: {
                id: usuario.id,
                rol: usuario.rol
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

/* ---|| INICIO DE SESION (LOGIN) ||--- */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        const isMatch = await usuario.compararPassword(password);
        if (!isMatch) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        if (usuario.rol === 'obrero') {
            return res.status(403).json({ mensaje: 'Acceso denegado. Personal obrero no tiene acceso al sistema.' });
        }

        const payload = {
            usuario: {
                id: usuario.id,
                rol: usuario.rol
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, rol: usuario.rol });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

/* ---|| RECUPERACION DE CONTRASEÑA ||--- */
exports.solicitarRecuperacion = async (req, res) => {
    try {
        const { cedula } = req.body;
        
        const usuario = await Usuario.findOne({ cedula });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Cédula no encontrada en el sistema.' });
        }

        usuario.solicitudRestablecimiento = {
            fecha: Date.now(),
            estado: 'pendiente'
        };

        await usuario.save();
        res.json({ mensaje: 'Solicitud enviada correctamente.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al procesar solicitud' });
    }
};

/* ---|| PREFIL DE USUARIO ||--- */
exports.obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-password');
        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};
/* ---|| CAMBIO DE CONTRASEÑA ||--- */
exports.cambiarPassword = async (req, res) => {
    try {
        const { passwordActual, passwordNuevo } = req.body;
        const usuario = await Usuario.findById(req.usuario.id);

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const isMatch = await usuario.compararPassword(passwordActual);
        if (!isMatch) {
            return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta' });
        }

        usuario.password = passwordNuevo;
        await usuario.save();

        res.json({ mensaje: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cambiar la contraseña' });
    }
};
