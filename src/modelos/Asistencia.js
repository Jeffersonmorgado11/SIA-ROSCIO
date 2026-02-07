const mongoose = require('mongoose');

/* ---|| ESQUEMA DE ASISTENCIA ||--- */
const asistenciaSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Obrero',
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    tipo: {
        type: String,
        enum: ['entrada', 'salida'],
        required: true
    },
});

module.exports = mongoose.model('Asistencia', asistenciaSchema);
