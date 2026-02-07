const mongoose = require('mongoose');
require('dotenv').config();
const Usuario = require('../modelos/Usuario');

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a Mongo para reset...');

        const res = await Usuario.deleteOne({ email: 'admin' });
        console.log('Resultado eliminación admin:', res);

        console.log('Admin eliminado. El servidor lo recreará en el próximo reinicio.');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetAdmin();
