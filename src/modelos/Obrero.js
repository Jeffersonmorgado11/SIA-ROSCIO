const mongoose = require('mongoose');

/* ---|| ESQUEMA DEL PERSONAL OBRERO ||--- */
const obreroSchema = new mongoose.Schema({
    nombres: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    cedula: {
        type: String,
        required: true,
        unique: true
    },
    edad: {
        type: Number,
        required: true
    },
    sexo: {
        type: String,
        enum: ['M', 'F'],
        required: true
    },
    cargo: {
        type: String,
        required: true
    },
    telefono: {
        type: String
    },
    discapacidad: {
        type: String,
        default: 'Ninguna'
    },
    permisos: {
        type: String, 
        default: 'Ninguno'
    },
    fechaIngreso: {
        type: Date,
        default: Date.now
    },
    tipoHorario: {
        type: String,
        enum: ['diario', 'guardia'],
        default: 'diario'
    },
    diasGuardia: [{
        type: Date
    }]
});

module.exports = mongoose.model('Obrero', obreroSchema);
