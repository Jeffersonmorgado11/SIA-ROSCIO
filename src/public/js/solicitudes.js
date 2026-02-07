/* ---|| CARGA INICIAL ||--- */
document.addEventListener('DOMContentLoaded', () => {
    cargarSolicitudes();
    cargarHistorial();
});

/* ---|| CARGAR PENDIENTES ||--- */
async function cargarSolicitudes() {
    const tbody = document.getElementById('tablaSolicitudes');
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/index.html';
            return;
        }

        const res = await fetch('/api/usuarios/solicitudes/pendientes', {
            headers: { 'x-auth-token': token }
        });
        
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                 window.location.href = '/index.html';
                 return;
            }
            throw new Error('Error de servidor');
        }
        
        const usuarios = await res.json();
        const template = document.getElementById('template-fila-solicitud');
        tbody.innerHTML = '';

        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">No hay solicitudes pendientes en este momento.</td></tr>';
            return;
        }

        usuarios.forEach(usuario => {
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.solicitud-cedula').textContent = usuario.cedula || 'N/A';
            clone.querySelector('.solicitud-nombre').textContent = usuario.nombre;
            clone.querySelector('.solicitud-email').textContent = usuario.email;
            
            const btnRestablecer = clone.querySelector('.btn-restablecer');
            btnRestablecer.onclick = () => restablecer(usuario._id);

            tbody.appendChild(clone);
        });

    } catch (error) {
        console.error(error);
        // En caso de error, se muestra un mensaje
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--peligro); padding: 20px;">Error al cargar las solicitudes. Intenta recargar la página.</td></tr>';
    }
}

/* ---|| CARGAR HISTORIAL ||--- */
async function cargarHistorial() {
    const tbody = document.getElementById('tablaHistorial');
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/usuarios/solicitudes/historial', {
            headers: { 'x-auth-token': token }
        });
        
        if (!res.ok) throw new Error('Error al cargar historial');
        
        const usuarios = await res.json();
        const template = document.getElementById('template-fila-historial-solicitud');
        tbody.innerHTML = '';

        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">No hay historial reciente.</td></tr>';
            return;
        }

        usuarios.forEach(u => {
            const clone = template.content.cloneNode(true);
            
            const fecha = new Date(u.solicitudRestablecimiento.fecha).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            clone.querySelector('.historial-fecha').textContent = fecha;
            clone.querySelector('.historial-cedula').textContent = u.cedula || 'N/A';
            clone.querySelector('.historial-nombre').textContent = u.nombre;

            tbody.appendChild(clone);
        });

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">No se pudo cargar el historial.</td></tr>';
    }
}

/* ---|| RESTABLECER PASSWORD ||--- */
async function restablecer(idUsuario) {
    mostrarConfirmacion('¿Deseas restablecer la contraseña de este usuario?', async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/usuarios/restablecer-password', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify({ idUsuario })
            });

            const data = await res.json();

            if (res.ok) {
                document.getElementById('tempPassword').textContent = data.passwordTemporal;
                document.getElementById('modalReset').style.display = 'block';
            } else {
                mostrarError(data.mensaje || 'Error al restablecer');
            }

        } catch (error) {
            console.error(error);
            mostrarError('Error de conexión');
        }
    });
}

/* ---|| PARA COPIAR LA CONTRASEÑA ||--- */
function copiarPassword() {
    const pass = document.getElementById('tempPassword').textContent;
    navigator.clipboard.writeText(pass).then(() => {
        mostrarExito('Contraseña copiada al portapapeles');
    });
}
