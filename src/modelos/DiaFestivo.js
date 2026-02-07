const mongoose = require('mongoose');

/* ---|| ESQUEMA PARA LO DEL DIA FESTIVO ||--- */
const diaFestivoSchema = new mongoose.Schema({
    fecha: {
        type: Date,
        required: true,
        unique: true
    },
    descripcion: {
        type: String,
        default: 'Feriado / Día Libre'
    }
});

module.exports = mongoose.model('DiaFestivo', diaFestivoSchema);
