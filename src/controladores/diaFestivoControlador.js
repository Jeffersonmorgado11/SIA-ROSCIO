const DiaFestivo = require('../modelos/DiaFestivo');

/* ---|| GESTIONAR DIA FESTIVO (TOGGLE) ||--- */

exports.toggleFestivo = async (req, res) => {
    try {
        const { fecha, fechas } = req.body;

        
        if (fechas && Array.isArray(fechas) && fechas.length > 0) {
            const primerFecha = new Date(fechas[0]);
            primerFecha.setUTCHours(0, 0, 0, 0);

            const primerExistente = await DiaFestivo.findOne({ fecha: primerFecha });
            const accion = primerExistente ? 'borrar' : 'crear';
            let mensaje = '';

            const fechasObj = fechas.map(f => {
                const d = new Date(f);
                d.setUTCHours(0, 0, 0, 0);
                return d;
            });

            if (accion === 'borrar') {
                await DiaFestivo.deleteMany({ fecha: { $in: fechasObj } });
                mensaje = `${fechas.length} días liberados (eliminados de festivos)`;
            } else {
                await DiaFestivo.deleteMany({ fecha: { $in: fechasObj } });

                const docs = fechasObj.map(f => ({ fecha: f }));
                await DiaFestivo.insertMany(docs);
                mensaje = `${fechas.length} días marcados como festivos`;
            }

            return res.json({ mensaje, accion });
        }

        const fechaObj = new Date(fecha);
        fechaObj.setUTCHours(0, 0, 0, 0);

        const existente = await DiaFestivo.findOne({ fecha: fechaObj });

        if (existente) {
            await DiaFestivo.findByIdAndDelete(existente._id);
            return res.json({ mensaje: 'Día festivo eliminado', accion: 'eliminado' });
        } else {
            const nuevo = new DiaFestivo({ fecha: fechaObj });
            await nuevo.save();
            return res.json({ mensaje: 'Día festivo registrado', accion: 'creado' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error del servidor');
    }
};

/* ---|| OBTENER FESTIVOS ||--- */
exports.obtenerFestivos = async (req, res) => {
    try {
        const festivos = await DiaFestivo.find();
        res.json(festivos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error del servidor');
    }
};
