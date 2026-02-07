const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/* ---|| ESQUEMA DE ADMIN/ADMINISTRATIVO ||--- */
const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    cedula: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['admin', 'administrativo', 'obrero'],
        default: 'obrero'
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    },
    solicitudRestablecimiento: {
        fecha: Date,
        estado: {
            type: String,
            enum: ['pendiente', 'resuelto', 'ninguna'],
            default: 'ninguna'
        }
    },
    historialRestablecimientos: [{
        fechaSolicitud: Date,
        fechaResolucion: {
            type: Date,
            default: Date.now
        }
    }]
});

/* ---|| ENCRIPTADO DE CONTRASEÑA ||--- */
usuarioSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/* ---|| COMPARACION DE CONTRASEÑA ||--- */
usuarioSchema.methods.compararPassword = async function (passwordIngresada) {
    return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
