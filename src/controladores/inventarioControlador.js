/* ---|| MODELOS ||--- */
const Producto = require('../modelos/Producto');
const Movimiento = require('../modelos/Movimiento');

/* ---|| OBTENER PRODUCTOS ||--- */
exports.obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener productos' });
    }
};

/* ---|| CREAR PRODUCTO ||--- */
exports.crearProducto = async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear producto' });
    }
};

/* ---|| REGISTRAR MOVIMIENTO ||--- */
exports.registrarMovimiento = async (req, res) => {
    try {
        const { productoId, tipo, cantidad, motivo } = req.body;
        const usuarioId = req.usuario.id;

        const producto = await Producto.findById(productoId);
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        if (tipo === 'entrada') {
            producto.stockActual += Number(cantidad);
        } else if (tipo === 'salida') {
            if (producto.stockActual < cantidad) {
                return res.status(400).json({ mensaje: 'Stock insuficiente' });
            }
            producto.stockActual -= Number(cantidad);
        } else {
            return res.status(400).json({ mensaje: 'Tipo de movimiento inválido' });
        }

        await producto.save();

        const movimiento = new Movimiento({
            producto: productoId,
            productoNombreSnapshot: producto.nombre,
            unidadMedidaSnapshot: producto.unidadMedida,
            tipo,
            cantidad,
            motivo,
            usuario: usuarioId
        });
        await movimiento.save();

        res.json({ mensaje: 'Movimiento registrado', stockActual: producto.stockActual });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar movimiento' });
    }
};

/* ---|| HISTORIAL DE MOVIMIENTOS ||--- */
exports.obtenerMovimientos = async (req, res) => {
    try {
        const movimientos = await Movimiento.find()
            .populate('producto', 'nombre')
            .populate('usuario', 'nombre')
            .sort({ fecha: -1 });
        res.json(movimientos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener historial' });
    }
};

/* ---|| ELIMINAR PRODUCTO ||--- */
exports.eliminarProducto = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

        const movimiento = new Movimiento({
            producto: producto._id,
            productoNombreSnapshot: producto.nombre,
            unidadMedidaSnapshot: producto.unidadMedida,
            tipo: 'eliminado',
            cantidad: producto.stockActual,
            motivo: 'Eliminación definitiva del inventario',
            usuario: req.usuario.id
        });
        await movimiento.save();

        await Producto.findByIdAndDelete(req.params.id);

        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar producto' });
    }
};
