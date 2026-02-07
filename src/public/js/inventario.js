/* ---|| CARGA INICIAL ||--- */
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    const buscador = document.getElementById('buscadorInventario');
    if (buscador) {
        buscador.addEventListener('input', (e) => filtrarProductos(e.target.value));
    }
});

/* ---|| VARIABLES GLOBALES ||--- */
let productosData = [];

/* ---|| MODALES ||--- */
function abrirModalProducto() {
    document.getElementById('productoModal').style.display = 'block';
}

/* ---|| MOVIMIENTOS ||--- */
function abrirModalMovimiento(id, nombre, tipo) {
    document.getElementById('movProductoId').value = id;
    document.getElementById('movProductoNombre').textContent = nombre;
    document.getElementById('movTipo').value = tipo;

    const titulo = tipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida';
    document.getElementById('movimientoTitulo').textContent = titulo;

    document.getElementById('movCantidad').value = '';
    document.getElementById('movMotivo').value = '';

    document.getElementById('movimientoModal').style.display = 'block';
}

/* ---|| CERRAR MODAL ||--- */
function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

/* ---|| CARGAR PRODUCTOS ||--- */
async function cargarProductos() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/inventario/productos', {
            headers: { 'x-auth-token': token }
        });
        productosData = await res.json();
        renderProductos(productosData);
    } catch (error) {
        console.error(error);
    }
}

function renderProductos(lista) {
    const tbody = document.getElementById('tablaProductos');
    const template = document.getElementById('template-producto');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se encontraron resultados</td></tr>';
        return;
    }

    lista.forEach(p => {
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.producto-nombre').textContent = p.nombre;
        clone.querySelector('.producto-categoria').textContent = p.categoria;
        
        const stockCell = clone.querySelector('.producto-stock');
        stockCell.textContent = p.stockActual;
        stockCell.style.color = p.stockActual <= p.stockMinimo ? 'red' : 'green';
        
        clone.querySelector('.producto-unidad').textContent = p.unidadMedida;
        
        const btnEntrada = clone.querySelector('.btn-entrada');
        btnEntrada.onclick = () => abrirModalMovimiento(p._id, p.nombre, 'entrada');
        
        const btnSalida = clone.querySelector('.btn-salida');
        btnSalida.onclick = () => abrirModalMovimiento(p._id, p.nombre, 'salida');
        
        const btnEliminar = clone.querySelector('.btn-eliminar');
        btnEliminar.onclick = () => eliminarProducto(p._id);

        tbody.appendChild(clone);
    });
}

/* ---|| FILTRADO PRODUCTOS ||--- */
function filtrarProductos(termino) {
    const texto = termino.toLowerCase();
    const filtrados = productosData.filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.categoria.toLowerCase().includes(texto)
    );
    renderProductos(filtrados);
}

/* ---|| CREAR PRODUCTO ||--- */
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'productoForm') {
        e.preventDefault();
        const data = {
            nombre: document.getElementById('nombreC').value,
            categoria: document.getElementById('categoriaC').value,
            unidadMedida: document.getElementById('unidadC').value,
            stockMinimo: document.getElementById('minimoC').value
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/inventario/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                mostrarExitoModal('Producto Creado Exitosamente');
                cerrarModal('productoModal');
                cargarProductos();
                document.getElementById('productoForm').reset();
            } else {
                mostrarError('Error al crear');
            }
        } catch (error) { console.error(error); }
    }
});

/* ---|| REGISTRAR MOVIMIENTO ||--- */
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'movimientoForm') {
        e.preventDefault();
        const data = {
            productoId: document.getElementById('movProductoId').value,
            tipo: document.getElementById('movTipo').value,
            cantidad: document.getElementById('movCantidad').value,
            motivo: document.getElementById('movMotivo').value
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/inventario/movimientos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(data)
            });

            const json = await res.json();

            if (res.ok) {
                mostrarExitoModal('Movimiento Registrado');
                cerrarModal('movimientoModal');
                cargarProductos();
            } else {
                mostrarError(json.mensaje || 'Error');
            }
        } catch (error) { console.error(error); }
    }
});

/* ---|| HISTORIAL ||--- */
let historialCompleto = [];

async function verHistorial() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/inventario/movimientos', { headers: { 'x-auth-token': token } });
        historialCompleto = await res.json();

        if (document.getElementById('fechaInicio')) {
            document.getElementById('fechaInicio').value = '';
            document.getElementById('fechaFin').value = '';
        }

        renderHistorial(historialCompleto);
        document.getElementById('historialModal').style.display = 'block';
    } catch (error) { console.error(error); }
}

function renderHistorial(lista) {
    const tbody = document.getElementById('tablaHistorial');
    const template = document.getElementById('template-fila-historial');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No se encontraron movimientos en este rango</td></tr>';
        return;
    }

    lista.forEach(m => {
        const clone = template.content.cloneNode(true);

        const nombreProducto = m.producto ? m.producto.nombre : (m.productoNombreSnapshot || 'Producto Eliminado');
        const unidad = (m.producto && m.producto.unidadMedida) ? m.producto.unidadMedida : (m.unidadMedidaSnapshot || '');
        const claseTipo = m.tipo === 'entrada' ? 'texto-exito' : (m.tipo === 'salida' ? 'texto-peligro' : 'texto-gris');
        
        const fechaStr = `${new Date(m.fecha).toLocaleDateString()} ${new Date(m.fecha).toLocaleTimeString()}`;

        clone.querySelector('.historial-fecha').textContent = fechaStr;
        clone.querySelector('.historial-producto').textContent = nombreProducto;
        
        const tdTipo = clone.querySelector('.historial-tipo');
        tdTipo.textContent = m.tipo.toUpperCase();
        tdTipo.className = `historial-tipo ${claseTipo}`;
        
        clone.querySelector('.historial-cantidad').textContent = `${m.cantidad} ${unidad}`;
        clone.querySelector('.historial-motivo').textContent = m.motivo;
        clone.querySelector('.historial-usuario').textContent = m.usuario ? m.usuario.nombre : 'Desc.';

        tbody.appendChild(clone);
    });
}

/* ---|| FILTRADO HISTORIAL ||--- */
window.filtrarHistorialPorFecha = () => {
    const inicioVal = document.getElementById('fechaInicio').value;
    const finVal = document.getElementById('fechaFin').value;

    if (!inicioVal && !finVal) {
        renderHistorial(historialCompleto);
        return;
    }

    const fechaInicio = inicioVal ? new Date(inicioVal + 'T00:00:00') : null;
    const fechaFin = finVal ? new Date(finVal + 'T23:59:59') : null;

    const filtrados = historialCompleto.filter(m => {
        const fechaMov = new Date(m.fecha);

        let cumpleInicio = true;
        let cumpleFin = true;

        if (fechaInicio) cumpleInicio = fechaMov >= fechaInicio;
        if (fechaFin) cumpleFin = fechaMov <= fechaFin;

        return cumpleInicio && cumpleFin;
    });

    renderHistorial(filtrados);
};

window.limpiarFiltroFechas = () => {
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    renderHistorial(historialCompleto);
};

/* ---|| ELIMINAR PRODUCTO ||--- */
window.eliminarProducto = function (id) {
    mostrarConfirmacion('¿Eliminar producto?', async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/inventario/productos/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                mostrarExitoModal('Producto eliminado correctamente');
                cargarProductos();
            } else {
                const json = await res.json();
                mostrarError(json.mensaje || 'Error al eliminar');
            }
        } catch (error) { console.error(error); }
    });
};

/* ---|| IMPRIMIR HISTORIAL ||--- */
window.imprimirHistorial = () => {
    document.body.classList.add('imprimiendo-modal');
    window.print();
    document.body.classList.remove('imprimiendo-modal');
};
