/* ---|| CARGA INICIAL ||--- */
document.addEventListener('DOMContentLoaded', () => {
    cargarPreAutorizados();
    cargarUsuarios();
});

const formPre = document.getElementById('preAuthForm');

/* ---|| PRE-AUTORIZACIONES ||--- */
async function cargarPreAutorizados() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/personal/pre-autorizados', { headers: { 'x-auth-token': token } });
        
        if (res.status === 403) {
             document.getElementById('tablaPreAuth').innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--peligro);">Acceso restringido a Administradores.</td></tr>';
             return;
        }
        if (!res.ok) throw new Error('Error al cargar pre-autorizados');
        
        const datos = await res.json();

        const tbody = document.getElementById('tablaPreAuth');
        const template = document.getElementById('template-fila-preauth');
        tbody.innerHTML = '';

        if (datos.length === 0) {
             tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay registros.</td></tr>';
             return;
        }

        datos.forEach(d => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.pre-cedula').textContent = d.cedula;
            clone.querySelector('.pre-nombre-completo').textContent = `${d.nombre} ${d.apellido}`;
            clone.querySelector('.pre-cargo').textContent = d.cargo;
            
            const spanEstado = clone.querySelector('.pre-estado');
            spanEstado.textContent = d.registrado ? 'Registrado' : 'Pendiente';
            spanEstado.className = `pre-estado estado-badge ${d.registrado ? 'estado-registrado' : 'estado-pendiente'}`;

            const btnEliminar = clone.querySelector('.btn-eliminar');
            btnEliminar.onclick = () => eliminarPre(d._id);

            tbody.appendChild(clone);
        });
    } catch (err) { 
        console.error(err); 
        document.getElementById('tablaPreAuth').innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error de conexión.</td></tr>';
    }
}

/* ---|| FORMULARIO PRE-AUTORIZACION ||--- */
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'preAuthForm') {
        e.preventDefault();
        
        const formPre = e.target;
        const data = {
            cedula: document.getElementById('preCedula').value,
            nombre: document.getElementById('preNombre').value,
            apellido: document.getElementById('preApellido').value,
            cargo: document.getElementById('preCargo').value
        };
    
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/personal/pre-autorizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(data)
            });
    
            if (res.ok) {
                mostrarExito('Autorizado correctamente', () => {
                    cerrarModal('preAuthModal');
                    cargarPreAutorizados();
                    formPre.reset();
                });
            } else {
                const json = await res.json();
                mostrarError(json.mensaje || 'Error');
            }
        } catch (err) { console.error(err); }
    }
});

/* ---|| ELIMINAR PRE-AUTORIZACION ||--- */
window.eliminarPre = async (id) => {
    mostrarConfirmacion('¿Eliminar autorización?', async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/personal/pre-autorizados/${id}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
            if (res.ok) cargarPreAutorizados();
        } catch (err) { console.error(err); }
    });
};

/* ---|| USUARIOS SISTEMA ||--- */
async function cargarUsuarios() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/personal/usuarios-sistema', { headers: { 'x-auth-token': token } });
        
        if (res.status === 401) {
            window.location.href = '/index.html';
            return;
        }
        if (res.status === 403) {
            document.getElementById('tablaUsuarios').innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--peligro);">No tienes permisos de Administrador para ver esto.</td></tr>';
            return;
        }
        if (!res.ok) throw new Error('Error al cargar usuarios');
        
        const datos = await res.json();

        const tbody = document.getElementById('tablaUsuarios');
        const template = document.getElementById('template-fila-usuario');
        tbody.innerHTML = '';

        if (datos.length === 0) {
             tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay usuarios registrados.</td></tr>';
             return;
        }

        datos.forEach(u => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.usuario-nombre').textContent = u.nombre;
            clone.querySelector('.usuario-email').textContent = u.email;
            clone.querySelector('.usuario-rol').textContent = u.rol;
            clone.querySelector('.usuario-cedula').textContent = u.cedula || 'N/A';
            
            const btnEliminar = clone.querySelector('.btn-eliminar');
            if (u.rol !== 'admin') {
                btnEliminar.onclick = () => eliminarUsuario(u._id);
            } else {
                btnEliminar.remove();
            }

            tbody.appendChild(clone);
        });
    } catch (err) { 
        console.error(err);
        const tbody = document.getElementById('tablaUsuarios');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar datos.</td></tr>';
    }
}

/* ---|| ELIMINAR USUARIO ||--- */
window.eliminarUsuario = async (id) => {
    mostrarConfirmacion('¿Eliminar usuario del sistema?', async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/personal/usuarios-sistema/${id}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
            if (res.ok) {
                cargarUsuarios();
                cargarPreAutorizados();
            }
        } catch (err) { console.error(err); }
    });
};

/* ---|| MODALES ||--- */
window.abrirModalPre = () => document.getElementById('preAuthModal').style.display = 'block';
