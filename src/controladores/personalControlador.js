/* ---|| MODELOS ||--- */
const Usuario = require('../modelos/Usuario');
const PreAutorizado = require('../modelos/PreAutorizado');
const Obrero = require('../modelos/Obrero');

/* ---|| GESTION PRE-AUTORIZADOS ||--- */
exports.crearPreAutorizado = async (req, res) => {
    try {
        const nuevo = new PreAutorizado(req.body);
        await nuevo.save();
        res.json(nuevo);
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ mensaje: 'Esta cédula ya se encuentra registrada.' });
        }
        res.status(500).json({ mensaje: 'Error al pre-autorizar' });
    }
};

exports.obtenerPreAutorizados = async (req, res) => {
    try {
        const lista = await PreAutorizado.find();
        res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener lista' });
    }
};

exports.eliminarPreAutorizado = async (req, res) => {
    try {
        await PreAutorizado.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar' });
    }
};

/* ---|| GESTION DE OBREROS ||--- */
exports.crearObrero = async (req, res) => {
    try {
        const obrero = new Obrero(req.body);
        await obrero.save();
        res.json(obrero);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar obrero' });
    }
};

exports.obtenerObreros = async (req, res) => {
    try {
        const obreros = await Obrero.find();
        res.json(obreros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener obreros' });
    }
};



exports.actualizarObrero = async (req, res) => {
    try {
        const actualizado = await Obrero.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar obrero' });
    }
};

exports.eliminarObrero = async (req, res) => {
    try {
        await Obrero.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Obrero eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar obrero' });
    }
};

/* ---|| USUARIOS DEL SISTEMA ||--- */
exports.obtenerUsuariosSistema = async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
};

// Eliminar Usuario Sistema
exports.eliminarUsuarioSistema = async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
};


