/* ---|| CARGA INICIAL ||--- */
document.addEventListener('DOMContentLoaded', () => {
    cargarObreros();
    const buscador = document.getElementById('buscadorObrero');
    if (buscador) {
        buscador.addEventListener('input', (e) => filtrarObreros(e.target.value));
    }
});

/* ---|| VARIABLES GLOBALES ||--- */
let editando = false;
let obrerosData = [];

/* ---|| CARGAR OBREROS ||--- */
async function cargarObreros() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/personal/obreros', { headers: { 'x-auth-token': token } });
        obrerosData = await res.json();
        renderObreros(obrerosData);
    } catch (err) { console.error(err); }
}

/* ---|| RENDERIZADO OBREROS ||--- */
function renderObreros(lista) {
    const tbody = document.getElementById('tablaObreros');
    const template = document.getElementById('template-obrero');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se encontraron resultados</td></tr>';
        return;
    }

    lista.forEach(o => {
        const clone = template.content.cloneNode(true);
        const tr = clone.querySelector('tr');

        clone.querySelector('.obrero-cedula').textContent = o.cedula;
        clone.querySelector('.obrero-nombre').textContent = `${o.nombres} ${o.apellidos}`;
        clone.querySelector('.obrero-cargo').textContent = o.cargo;

        // Botones
        const btnVer = clone.querySelector('.btn-ver');
        btnVer.onclick = () => verObrero(o._id);

        const btnEditar = clone.querySelector('.btn-editar');
        btnEditar.onclick = () => editarObrero(o._id);

        const btnGuardia = clone.querySelector('.btn-guardia');
        if (o.tipoHorario === 'guardia') {
            btnGuardia.style.display = 'inline-block';
            btnGuardia.onclick = () => gestionarGuardias(o._id);
        }

        const btnEliminar = clone.querySelector('.btn-eliminar');
        btnEliminar.onclick = () => eliminarObrero(o._id);

        tbody.appendChild(clone);
    });
}

/* ---|| FILTRADO ||--- */
function filtrarObreros(termino) {
    const texto = termino.toLowerCase();
    const filtrados = obrerosData.filter(o =>
        (o.nombres + ' ' + o.apellidos).toLowerCase().includes(texto) ||
        o.cedula.includes(texto) ||
        o.cargo.toLowerCase().includes(texto)
    );
    renderObreros(filtrados);
}


/* ---|| FORMULARIO OBRERO ||--- */
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'obreroForm') {
        e.preventDefault();
        
        const data = {
            nombres: document.getElementById('obNombres').value,
            apellidos: document.getElementById('obApellidos').value,
            cedula: document.getElementById('obCedula').value,
            sexo: document.getElementById('obSexo').value,
            edad: document.getElementById('obEdad').value,
            telefono: document.getElementById('obTelefono').value,
            cargo: document.getElementById('obCargo').value,
            discapacidad: document.getElementById('obDiscapacidad').value,
            permisos: document.getElementById('obPermisos').value,
            tipoHorario: document.getElementById('obTipoHorario').value
        };

        const method = editando ? 'PUT' : 'POST';
        const id = document.getElementById('obreroId').value;
        const url = editando ? `/api/personal/obreros/${id}` : '/api/personal/obreros';

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                mostrarExitoModal(editando ? 'Obrero actualizado correctamente' : 'Obrero registrado correctamente');
                cerrarModalObrero('obreroModal');
                cargarObreros();
            } else {
                const json = await res.json();
                mostrarError(json.mensaje || 'Error');
            }
        } catch (err) { console.error(err); }
    }
});

/* ---|| MODALES Y UTILIDADES ||--- */
window.mostrarExitoModal = (mensaje) => {
    document.getElementById('mensajeExitoTexto').textContent = mensaje;
    document.getElementById('modalExito').style.display = 'block';
};

window.cerrarModalExito = () => {
    document.getElementById('modalExito').style.display = 'none';
};

window.verObrero = (id) => {
    const obrero = obrerosData.find(o => o._id === id);
    if (!obrero) return;

    document.getElementById('verNombreCompleto').textContent = `${obrero.nombres} ${obrero.apellidos}`;
    document.getElementById('verCedula').textContent = obrero.cedula;
    document.getElementById('verCargo').textContent = obrero.cargo;
    document.getElementById('verFechaIngreso').textContent = new Date(obrero.fechaIngreso).toLocaleDateString();
    document.getElementById('verSexo').textContent = obrero.sexo === 'M' ? 'Masculino' : 'Femenino';
    document.getElementById('verEdad').textContent = obrero.edad + ' años';
    document.getElementById('verTelefono').textContent = obrero.telefono || 'N/A';
    document.getElementById('verDiscapacidad').textContent = obrero.discapacidad || 'Ninguna';
    document.getElementById('verPermisos').textContent = obrero.permisos || 'Ninguno';

    document.getElementById('verObreroModal').style.display = 'block';
};

window.editarObrero = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/personal/obreros', { headers: { 'x-auth-token': token } });
        const datos = await res.json();
        const obrero = datos.find(o => o._id === id);

        if (obrero) {
            document.getElementById('obreroId').value = obrero._id;
            document.getElementById('obNombres').value = obrero.nombres;
            document.getElementById('obApellidos').value = obrero.apellidos;
            document.getElementById('obCedula').value = obrero.cedula;
            document.getElementById('obSexo').value = obrero.sexo;
            document.getElementById('obEdad').value = obrero.edad;
            document.getElementById('obTelefono').value = obrero.telefono || '';
            document.getElementById('obCargo').value = obrero.cargo;
            document.getElementById('obDiscapacidad').value = obrero.discapacidad;
            document.getElementById('obDiscapacidad').value = obrero.discapacidad;
            document.getElementById('obPermisos').value = obrero.permisos;
            document.getElementById('obTipoHorario').value = obrero.tipoHorario || 'diario';

            document.getElementById('modalTitle').textContent = 'Editar Obrero';
            editando = true;
            abrirModalObrero();
        }
    } catch (err) { console.error(err); }
};

window.eliminarObrero = async (id) => {
    mostrarConfirmacion('¿Eliminar registro de obrero?', async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/personal/obreros/${id}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
            if (res.ok) cargarObreros();
        } catch (err) { console.error(err); }
    });
};

window.abrirModalObrero = () => {
    const form = document.getElementById('obreroForm');
    if (!editando && form) form.reset();
    
    const modal = document.getElementById('obreroModal');
    if (modal) modal.style.display = 'block';
};

window.cerrarModalObrero = (id) => {
    window.cerrarModal(id);
    editando = false;
    document.getElementById('modalTitle').textContent = 'Registrar Obrero';
    document.getElementById('obreroForm').reset();
};

/* ---|| GESTION DE GUARDIAS ||--- */
let obreroGuardiaId = null;
let diasGuardiaSeleccionados = [];
let fechaCalendarioGuardia = new Date();
window.gestionarGuardias = async (id) => {
    obreroGuardiaId = id;
    diasGuardiaSeleccionados = [];
    fechaCalendarioGuardia = new Date();
    
    const obrero = obrerosData.find(o => o._id === id);
    if (obrero && obrero.diasGuardia) {
        diasGuardiaSeleccionados = obrero.diasGuardia.map(f => new Date(f).toISOString().split('T')[0]);
    }

    renderizarCalendarioGuardia();
    document.getElementById('guardiasModal').style.display = 'block';
};

window.cambiarMesGuardia = (delta) => {
    fechaCalendarioGuardia.setMonth(fechaCalendarioGuardia.getMonth() + delta);
    renderizarCalendarioGuardia();
};

/* ---|| CALENDARIO GUARDIAS ||--- */
function renderizarCalendarioGuardia() {
    const year = fechaCalendarioGuardia.getFullYear();
    const month = fechaCalendarioGuardia.getMonth();
    
    const nombreMes = fechaCalendarioGuardia.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    document.getElementById('tituloMesGuardia').textContent = nombreMes.toUpperCase();

    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicioSemana = primerDia.getDay();

    const contenedor = document.getElementById('calendarioGuardias');
    contenedor.innerHTML = '';
    
    const diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    diasSemana.forEach(d => {
        const div = document.createElement('div');
        div.className = 'calendario-header';
        div.textContent = d;
        contenedor.appendChild(div);
    });

    for (let i = 0; i < diaInicioSemana; i++) {
        contenedor.appendChild(document.createElement('div'));
    }
    for (let i = 1; i <= diasEnMes; i++) {
        const fecha = new Date(year, month, i);
        const fechaISO = fecha.toISOString().split('T')[0];
        const div = document.createElement('div');
        div.className = 'calendario-dia';
        div.textContent = i;
        
        if (diasGuardiaSeleccionados.includes(fechaISO)) {
            div.classList.add('dia-seleccionado');
        }

        div.onclick = () => toggleDiaGuardia(fechaISO);
        contenedor.appendChild(div);
    }
}

function toggleDiaGuardia(fechaISO) {
    const idx = diasGuardiaSeleccionados.indexOf(fechaISO);
    if (idx > -1) {
        diasGuardiaSeleccionados.splice(idx, 1);
    } else {
        diasGuardiaSeleccionados.push(fechaISO);
    }
    renderizarCalendarioGuardia();
}

window.guardarGuardias = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/personal/obreros/${obreroGuardiaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ diasGuardia: diasGuardiaSeleccionados })
        });

        if (res.ok) {
            mostrarExitoModal('Días de guardia actualizados');
            window.cerrarModal('guardiasModal');
            cargarObreros();
        } else {
            mostrarError('Error al guardar guardias');
        }
    } catch (error) {
        console.error(error);
        mostrarError('Error de conexión');
    }
};
