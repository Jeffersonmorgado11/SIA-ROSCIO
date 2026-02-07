const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const conectarDB = require('./src/config/base_de_datos');

// Cargar variables de entorno
dotenv.config();

// Conectar a Base de Datos
conectarDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src/public')));

// Rutas 
app.use('/api/auth', require('./src/rutas/authRutas'));
app.use('/api/personal', require('./src/rutas/personalRutas'));
app.use('/api/inventario', require('./src/rutas/inventarioRutas'));
app.use('/api/asistencia', require('./src/rutas/asistenciaRutas'));
app.use('/api/dias-festivos', require('./src/rutas/diaFestivoRutas'));
app.use('/api/usuarios', require('./src/rutas/usuarioRutas'));

// Ruta base
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/public/index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
