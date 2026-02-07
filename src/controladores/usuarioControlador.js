const Usuario = require('../modelos/Usuario');
const bcrypt = require('bcryptjs');

/* ---|| OBTENER USUARIOS ||--- */
exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password');
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
};

/* ---|| CREAR USUARIO ||--- */
exports.crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        let usuario = await Usuario.findOne({ email });
        if (usuario) {
            return res.status(400).json({ mensaje: 'El usuario ya existe' });
        }

        usuario = new Usuario({
            nombre,
            email,
            password,
            rol
        });

        await usuario.save();
        res.status(201).json({ mensaje: 'Usuario creado exitosamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear usuario' });
    }
};

/* ---|| ACTUALIZAR USUARIO ||--- */
exports.actualizarUsuario = async (req, res) => {
    try {
        const { nombre, email, rol } = req.body;

        let usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        usuario.nombre = nombre || usuario.nombre;
        usuario.email = email || usuario.email;
        usuario.rol = rol || usuario.rol;

        await usuario.save();
        res.json({ mensaje: 'Usuario actualizado', usuario });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
};

/* ---|| ELIMINAR USUARIO ||--- */
exports.eliminarUsuario = async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
};

/* ---|| SOLICITUDES PASSWORD ||--- */
exports.obtenerSolicitudes = async (req, res) => {
    try {
        const usuarios = await Usuario.find({ 
            'solicitudRestablecimiento.estado': 'pendiente' 
        }).select('nombre email cedula solicitudRestablecimiento');
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener solicitudes' });
    }
};

/* ---|| RESTABLECER PASSWORD ||--- */
exports.restablecerPassword = async (req, res) => {
    try {
        const { idUsuario } = req.body;
        const usuario = await Usuario.findById(idUsuario);

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // JGR + ultimos 4 digitos de cedula 
        // En algun caso super extraño de que no tenga cedula, se generan 4 digitos aleatorios
        const sufijo = usuario.cedula ? usuario.cedula.slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();
        const passwordTemporal = `JGR${sufijo}`;

        usuario.password = passwordTemporal;

        usuario.solicitudRestablecimiento.estado = 'resuelto';
        
        usuario.historialRestablecimientos.push({
            fechaSolicitud: usuario.solicitudRestablecimiento.fecha,
            fechaResolucion: new Date()
        });

        await usuario.save();

        res.json({ 
            mensaje: 'Contraseña restablecida exitosamente', 
            passwordTemporal 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al restablecer contraseña' });
    }
};

/* ---|| HISTORIAL PASSWORD ||--- */
exports.obtenerHistorialSolicitudes = async (req, res) => {
    try {
        const usuarios = await Usuario.find({ 
            'historialRestablecimientos.0': { $exists: true } 
        }).select('nombre email cedula historialRestablecimientos');
        
        const historialEventos = [];

        usuarios.forEach(user => {
            user.historialRestablecimientos.forEach(evento => {
                historialEventos.push({
                    _id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    cedula: user.cedula,
                    solicitudRestablecimiento: {
                        fecha: evento.fechaResolucion,
                        estado: 'resuelto'
                    }
                });
            });
        });

        historialEventos.sort((a, b) => new Date(b.solicitudRestablecimiento.fecha) - new Date(a.solicitudRestablecimiento.fecha));
        
        res.json(historialEventos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener historial' });
    }
};
