const mongoose = require('mongoose');

/* ---|| ESQUEMA DE MOVIMIENTO DE INVENTARIO ||--- */
const movimientoSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },
    tipo: {
        type: String,
        required: true,
        enum: ['entrada', 'salida', 'eliminado']
    },
    productoNombreSnapshot: {
        type: String 
    },
    unidadMedidaSnapshot: {
        type: String 
    },
    cantidad: {
        type: Number,
        required: true
    },
    motivo: {
        type: String, 
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
});

module.exports = mongoose.model('Movimiento', movimientoSchema);
