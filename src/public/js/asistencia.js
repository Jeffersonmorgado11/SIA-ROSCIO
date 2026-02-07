/* ---|| CARGA INICIAL ||--- */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tablaAsistenciaMensual')) {
        cargarCuadriculaMensual();
        initDragSelection();
    }
    if (document.getElementById('tablaMisAsistencias')) {
        cargarMisAsistencias();
    }
    
    // Evento para el buscador
    const buscadorInput = document.getElementById('buscadorAsistencia');
    if (buscadorInput) {
        buscadorInput.addEventListener('input', (e) => {
            filtroBusqueda = e.target.value;
            filtrarYRenderizar();
        });
    }
});

/* ---|| VARIABLES GLOBALES ||--- */
let diasHabilesMes = [];
let fechaVisualizada = new Date();
let diasFestivos = [];
let isDragging = false;
let dragStartIndex = -1;
let dragEndIndex = -1;
let diasRenderizadosRef = [];

/* ---|| PARA LA INTERACCION ||--- */
function cambiarMes(delta) {
    fechaVisualizada.setMonth(fechaVisualizada.getMonth() + delta);
    cargarCuadriculaMensual();
}

let todosLosObreros = [];
let todasLasAsistencias = [];
let filtroPestanaActual = 'general';
let filtroBusqueda = '';

window.cambiarPestaña = (tipo) => {
    filtroPestanaActual = tipo;
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(tipo === 'general' ? 'General' : 'Vigilantes')) {
            btn.classList.add('active');
        }
    });

    filtrarYRenderizar();
};

/* ---|| FILTRADO Y RENDERIZADO ||--- */
function filtrarYRenderizar() {
    const tbody = document.getElementById('tablaAsistenciaMensual');
    if (!tbody) return;
    tbody.innerHTML = '';

    const obrerosFiltrados = todosLosObreros.filter(o => {
        let cumplePestana = false;
        if (filtroPestanaActual === 'guardia') {
            cumplePestana = o.tipoHorario === 'guardia';
        } else {
            cumplePestana = o.tipoHorario !== 'guardia';
        }

        let cumpleBusqueda = true;
        if (filtroBusqueda) {
            const termino = filtroBusqueda.toLowerCase();
            const nombreCompleto = `${o.nombres} ${o.apellidos}`.toLowerCase();
            cumpleBusqueda = nombreCompleto.includes(termino) || o.cedula.includes(termino);
        }

        return cumplePestana && cumpleBusqueda;
    });

    renderizarTabla(obrerosFiltrados);
}

/* ---|| CARGA DE DATOS ||--- */
async function cargarCuadriculaMensual() {
    try {
        const token = localStorage.getItem('token');
        const year = fechaVisualizada.getFullYear();
        const month = fechaVisualizada.getMonth();

        const nombreMes = fechaVisualizada.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        document.getElementById('mesActualTitulo').textContent = nombreMes.toUpperCase();

        const resFestivos = await fetch('/api/dias-festivos', { headers: { 'x-auth-token': token } });
        const festivosData = await resFestivos.json();
        diasFestivos = festivosData.map(f => new Date(f.fecha).toISOString().split('T')[0]);

        diasHabilesMes = generarDiasLaborables(year, month);
        diasRenderizadosRef = [...diasHabilesMes]; 

        renderizarEncabezado(diasHabilesMes);

        // --- CARGA DE DATOS ( DESDE CACHE) ---
        const resObreros = await fetch('/api/personal/obreros', { headers: { 'x-auth-token': token } });
        todosLosObreros = await resObreros.json();

        const primerDia = new Date(year, month, 1).toISOString().split('T')[0];
        const ultimoDia = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const resAsistencia = await fetch(`/api/asistencia/reporte?fechaInicio=${primerDia}&fechaFin=${ultimoDia}`, { headers: { 'x-auth-token': token } });
        todasLasAsistencias = await resAsistencia.json();

        filtrarYRenderizar();

    } catch (error) {
        console.error('Error cargando cuadrícula:', error);
    }
}

/* ---|| RENDERIZADO DE TABLA ||--- */
function renderizarTabla(obreros) {
    const tbody = document.getElementById('tablaAsistenciaMensual');
    
    const template = document.getElementById('template-fila-asistencia-info');
    
    obreros.forEach((obrero, index) => {
        const tr = document.createElement('tr');
        
        const clone = template.content.cloneNode(true);
        clone.querySelector('.asistencia-index').textContent = index + 1;
        clone.querySelector('.asistencia-nombre').textContent = `${obrero.nombres} ${obrero.apellidos}`;
        clone.querySelector('.asistencia-cedula').textContent = obrero.cedula;
        
        tr.appendChild(clone.querySelector('.asistencia-index'));
        tr.appendChild(clone.querySelector('.asistencia-nombre-container'));

        diasHabilesMes.forEach(diaObj => {
            const td = document.createElement('td');
            const fechaISO = diaObj.date.toISOString().split('T')[0];
            const esHoy = esMismaFecha(diaObj.date, new Date());
            const esFuturo = diaObj.date > new Date() && !esHoy;
            const esFestivo = diasFestivos.includes(fechaISO);
            const diaSemana = diaObj.date.getDay(); 

            // Logica de la disponibilidad
            let esDiaLaborable = true;
            
            if (obrero.tipoHorario === 'guardia') {
                const tieneGuardia = obrero.diasGuardia && obrero.diasGuardia.some(f => new Date(f).toISOString().split('T')[0] === fechaISO);
                if (!tieneGuardia) {
                    esDiaLaborable = false;
                    td.style.backgroundColor = '#f0f0f0'; 
                }
            } else {
                if (diaSemana === 0 || diaSemana === 6) {
                    esDiaLaborable = false;
                    td.style.backgroundColor = '#e0e0e0'; 
                }
            }

            const asistencia = todasLasAsistencias.find(a => {
                const mismaFecha = a.fecha.startsWith(fechaISO);
                const mismoUsuario = (a.usuario && a.usuario.cedula === obrero.cedula) || (a.cedula === obrero.cedula);
                return mismaFecha && mismoUsuario && a.tipo === 'entrada';
            });

            const asistio = !!asistencia;

            // Estilos base
            if (esFestivo) {
                td.classList.add('columna-festiva');
            } else if (esHoy) {
                td.classList.add('columna-hoy');
            } else if (!esDiaLaborable) {
                td.classList.add('celda-bloqueada');
            }

            const disabled = !esHoy || esFestivo || !esDiaLaborable;
            let checked = asistio ? 'checked' : '';

            if (esFestivo) {
                const span = document.createElement('span');
                span.style.cssText = "font-size: 10px; font-weight: bold; color: #e65100;";
                span.textContent = 'FESTIVO';
                td.appendChild(span);
            } else if (!esDiaLaborable) {
                const span = document.createElement('span');
                span.style.cssText = "font-size: 18px; color: #ccc;";
                span.textContent = '-';
                td.appendChild(span);
            } else if (esFuturo) {
                td.textContent = '-';
            } else {
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'checkbox-asistencia';
                input.dataset.cedula = obrero.cedula;
                input.dataset.fecha = fechaISO;
                if (checked) input.checked = true;
                if (disabled) input.disabled = true;
                input.onchange = () => cambiarAsistencia(input);
                td.appendChild(input);
            }
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    const MIN_FILAS = 15;
    const filasActuales = obreros.length;
    if (filasActuales < MIN_FILAS) {
        const filasFaltantes = MIN_FILAS - filasActuales;
        for (let i = 0; i < filasFaltantes; i++) {
            const tr = document.createElement('tr');
            
            const tdIndex = document.createElement('td');
            tdIndex.style.textAlign = 'center';
            tdIndex.textContent = filasActuales + i + 1;
            tr.appendChild(tdIndex);

            const tdEspacio = document.createElement('td');
            tdEspacio.style.height = '35px';
            tdEspacio.innerHTML = '&nbsp;';
            tr.appendChild(tdEspacio);
            diasHabilesMes.forEach(diaObj => {
                const fechaISO = diaObj.date.toISOString().split('T')[0];
                const esFestivo = diasFestivos.includes(fechaISO);
                const esHoy = esMismaFecha(diaObj.date, new Date()); 
                
                let clase = '';
                if (esFestivo) clase = 'columna-festiva';
                else if (esHoy) clase = 'columna-hoy';

                tr.innerHTML += `<td class="${clase}"></td>`;
            });
            tbody.appendChild(tr);
        }
    }
}

/* ---|| SELECCION MULTIPLE ||--- */
function initDragSelection() {
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            finalizarSeleccion();
        }
    });
}

function finalizarSeleccion() {
    isDragging = false;

    const start = Math.min(dragStartIndex, dragEndIndex);
    const end = Math.max(dragStartIndex, dragEndIndex);

    if (start === -1 || end === -1) return;

    const fechasSeleccionadas = [];
    for (let i = start; i <= end; i++) {
        fechasSeleccionadas.push(diasRenderizadosRef[i].date.toISOString().split('T')[0]);
    }

    if (fechasSeleccionadas.length > 0) {
        toggleFestivosBulk(fechasSeleccionadas);
    }

    document.querySelectorAll('.header-numero').forEach(th => th.classList.remove('header-seleccion-temp'));
    dragStartIndex = -1;
    dragEndIndex = -1;
}

/* ---|| RENDERIZADO ENCABEZADO ||--- */
function renderizarEncabezado(dias) {
    const thead = document.getElementById('tablaEncabezado');
    thead.innerHTML = '';

    const trIniciales = document.createElement('tr');
    trIniciales.innerHTML = '<th colspan="2"></th>';

    const trNumeros = document.createElement('tr');
    trNumeros.innerHTML = '<th style="width: 30px;">N°</th><th>Nombre Completo</th>';

    const hoy = new Date();

    dias.forEach((d, index) => {
        const esHoy = esMismaFecha(d.date, hoy);
        const fechaISO = d.date.toISOString().split('T')[0];
        const esFestivo = diasFestivos.includes(fechaISO);

        const thInicial = document.createElement('th');
        thInicial.textContent = d.diaStr;
        thInicial.className = 'header-inicial';
        if (esFestivo) thInicial.classList.add('header-festivo');
        else if (esHoy) thInicial.classList.add('header-hoy');
        trIniciales.appendChild(thInicial);

        const thNumero = document.createElement('th');
        thNumero.textContent = d.date.getDate();
        thNumero.className = 'header-numero';
        thNumero.dataset.index = index; 

        if (esFestivo) thNumero.classList.add('header-festivo');
        else if (esHoy) thNumero.classList.add('header-hoy');

        // --- DRAG ---
        thNumero.onmousedown = (e) => {
            e.preventDefault(); 
            isDragging = true;
            dragStartIndex = index;
            dragEndIndex = index;
            thNumero.classList.add('header-seleccion-temp');
        };

        thNumero.onmouseover = () => {
            if (isDragging) {
                dragEndIndex = index;
                actualizarVisualSeleccion();
            }
        };

        thNumero.title = "Arrastra para seleccionar múltiples";

        trNumeros.appendChild(thNumero);
    });

    thead.appendChild(trIniciales);
    thead.appendChild(trNumeros);
}

/* ---|| LOGICA VISUAL SELECCION ||--- */
function actualizarVisualSeleccion() {
    const start = Math.min(dragStartIndex, dragEndIndex);
    const end = Math.max(dragStartIndex, dragEndIndex);

    document.querySelectorAll('.header-numero').forEach((th, idx) => {
        const thIndex = parseInt(th.dataset.index);
        if (!isNaN(thIndex)) {
            if (thIndex >= start && thIndex <= end) {
                th.classList.add('header-seleccion-temp');
            } else {
                th.classList.remove('header-seleccion-temp');
            }
        }
    });
}

/* ---|| ACCIONES MASIVAS ||--- */
async function toggleFestivosBulk(fechasISO) {
    const mensaje = fechasISO.length > 1
        ? `¿Deseas marcar/desmarcar ${fechasISO.length} días como festivos?`
        : `¿Deseas marcar/desmarcar el ${fechasISO[0]} como festivo?`;

    mostrarConfirmacion(mensaje, async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/dias-festivos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ fechas: fechasISO }) 
            });
            const data = await res.json();
            mostrarExito(data.mensaje);
            cargarCuadriculaMensual();
        } catch (error) {
            console.error(error);
            mostrarError('Error al actualizar días festivos');
        }
    });
}

/* ---|| UTILIDADES FECHAS ||--- */
function esMismaFecha(d1, d2) {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
}



// --- ACTUALIZACION DE FUNCIONES ORIGINALES ---

async function toggleFestivo(fechaISO) {
    mostrarConfirmacion(`¿Deseas marcar/desmarcar el ${fechaISO} como día festivo/libre?`, async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/dias-festivos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ fecha: fechaISO })
            });
            const data = await res.json();
            mostrarExito(data.mensaje);
            cargarCuadriculaMensual();
        } catch (error) {
            console.error(error);
            mostrarError('Error al actualizar día festivo');
        }
    });
}

function generarDiasLaborables(year, month) {
    const list = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        const diaSemana = date.getDay();
        list.push({
            date: new Date(date),
            diaStr: ['D', 'L', 'M', 'M', 'J', 'V', 'S'][diaSemana]
        });
        date.setDate(date.getDate() + 1);
    }
    return list;
}

/* ---|| REGISTRO ASISTENCIA ||--- */
async function cambiarAsistencia(checkbox) {
    const cedula = checkbox.dataset.cedula;
    const marcado = checkbox.checked;

    if (!marcado) {
        mostrarError('Para eliminar una asistencia, contacte al soporte, que por integridad no se puede eliminar.');
        checkbox.checked = true;
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/asistencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ cedula, tipo: 'entrada' })
        });

        if (!res.ok) {
            const data = await res.json();
            mostrarError(data.mensaje || 'Error');
            checkbox.checked = !marcado; 
        }
    } catch (error) {
        console.error(error);
        checkbox.checked = !marcado;
    }
}
