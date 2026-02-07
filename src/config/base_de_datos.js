/* ---|| DEPENDENCIAS ||--- */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/* ---|| CONEXIÓN BASE DE DATOS ||--- */
const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB se conectó exitosamente :)');

        /* ---|| ADMIN POR DEFECTO ||--- */
        // Se crea si no existe
        // Usuario: admin, y contraseña: Admin
        // Por defecto al iniciar el sistema, que luego el usuario la podra cambiar sin problemas
        const Usuario = require('../modelos/Usuario');
        const adminExistente = await Usuario.findOne({ rol: 'admin' });

        if (!adminExistente) {
            console.log('Creando usuario Admin por defecto...');
            const admin = new Usuario({
                nombre: 'Administrador Sistema',
                email: 'admin', 
                password: 'Admin', 
                rol: 'admin',
                cedula: '00000000'
            });
            await admin.save();
            console.log('Usuario Admin creado: User: admin, Pass: Admin');
        }

    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;
