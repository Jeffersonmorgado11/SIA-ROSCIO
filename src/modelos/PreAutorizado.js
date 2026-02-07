const mongoose = require('mongoose');

/* ---|| ESQUEMA DE PERSONAL PRE-AUTORIZADO ||--- */
const preAutorizadoSchema = new mongoose.Schema({
    cedula: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String, 
        required: true
    },
    cargo: {
        type: String,
        required: true
    },
    registrado: {
        type: Boolean,
        default: false 
    }
});

module.exports = mongoose.model('PreAutorizado', preAutorizadoSchema);
