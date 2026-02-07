/* ---|| MODELOS ||--- */
const Asistencia = require('../modelos/Asistencia');
const Obrero = require('../modelos/Obrero');

/* ---|| REGISTRAR ASISTENCIA ||--- */
exports.registrarAsistencia = async (req, res) => {
    try {
        const { cedula, tipo } = req.body;

        const obrero = await Obrero.findOne({ cedula });
        if (!obrero) {
            return res.status(404).json({ mensaje: 'Obrero no encontrado' });
        }
        const asistencia = new Asistencia({
            usuario: obrero._id,
            tipo
        });

        await asistencia.save();
        res.status(201).json({
            mensaje: `Asistencia (${tipo}) registrada para ${obrero.nombres}`,
            fecha: asistencia.fecha
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar asistencia' });
    }
};

/* ---|| REPORTE DE ASISTENCIAS ||--- */
exports.obtenerReporteAsistencias = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        let filtro = {};

        if (fechaInicio && fechaFin) {
            filtro.fecha = {
                $gte: new Date(fechaInicio),
                $lte: new Date(fechaFin)
            };
        }

        const asistencias = await Asistencia.find(filtro)
            .populate('usuario', 'nombres apellidos cedula cargo')
            .sort({ fecha: -1 });

        res.json(asistencias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener reporte' });
    }
};
