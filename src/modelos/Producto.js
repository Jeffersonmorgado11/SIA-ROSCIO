const mongoose = require('mongoose');

/* ---|| ESQUEMA DE PRODUCTO DE INVENTARIO ||--- */
const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    categoria: {
        type: String,
        required: true,
        enum: ['alimento', 'utensilio', 'limpieza', 'otro']
    },
    unidadMedida: {
        type: String,
        required: true,
        default: 'unidad'
    },
    stockActual: {
        type: Number,
        default: 0
    },
    stockMinimo: {
        type: Number,
        default: 5
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Producto', productoSchema);
