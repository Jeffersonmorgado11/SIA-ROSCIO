/* ---|| CARGA INICIAL ||--- */
document.addEventListener('DOMContentLoaded', cargarUsuarios);

/* ---|| VARIABLES GLOBALES ||--- */
const modal = document.getElementById('usuarioModal');
const form = document.getElementById('usuarioForm');
const modalTitle = document.getElementById('modalTitle');
const userIdInput = document.getElementById('usuarioId');

/* ---|| GESTION DE MODAL ||--- */
function abrirModal(usuario = null) {
    if (usuario) {
        modalTitle.textContent = 'Editar Usuario';
        userIdInput.value = usuario._id;
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('email').value = usuario.email;
        document.getElementById('rol').value = usuario.rol;
        document.getElementById('password').removeAttribute('required');
        document.getElementById('password').placeholder = "Dejar en blanco para mantener actual";
    } else {
        modalTitle.textContent = 'Nuevo Usuario';
        form.reset();
        userIdInput.value = '';
        document.getElementById('password').setAttribute('required', 'true');
        document.getElementById('password').placeholder = "Requerido";
    }
    modal.style.display = 'block';
}

function cerrarModal() {
    window.cerrarModal('usuarioModal');
}

/* ---|| CARGAR USUARIOS ||--- */
async function cargarUsuarios() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/usuarios', {
            headers: { 'x-auth-token': token }
        });
        const usuarios = await res.json();

        const template = document.getElementById('template-fila-usuario');
        tbody.innerHTML = '';

        usuarios.forEach(usuario => {
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.usuario-nombre').textContent = usuario.nombre;
            clone.querySelector('.usuario-email').textContent = usuario.email;
            clone.querySelector('.usuario-rol').textContent = usuario.rol;
            
            const btnEditar = clone.querySelector('.btn-editar');
            btnEditar.onclick = () => editarUsuario(usuario);
            
            const btnEliminar = clone.querySelector('.btn-eliminar');
            btnEliminar.onclick = () => eliminarUsuario(usuario._id);

            tbody.appendChild(clone);
        });
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

/* ---|| CRUD USUARIOS ||--- */
window.editarUsuario = function (usuario) {
    abrirModal(usuario);
};

window.eliminarUsuario = async function (id) {
    mostrarConfirmacion('¿Estás seguro de eliminar este usuario?', async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                mostrarExito('Usuario eliminado', () => cargarUsuarios());
            } else {
                mostrarError('Error al eliminar');
            }
        } catch (error) {
            console.error(error);
        }
    });
};

/* ---|| GUARDAR USUARIO ||--- */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = userIdInput.value;
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;

    const datos = { nombre, email, rol };
    if (password) datos.password = password;

    const url = id ? `/api/usuarios/${id}` : '/api/usuarios';
    const method = id ? 'PUT' : 'POST';

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(datos)
        });

        const data = await res.json();

        if (res.ok) {
            mostrarExito(data.mensaje || 'Operación exitosa', () => {
                cerrarModal();
                cargarUsuarios();
            });
        } else {
            mostrarError(data.mensaje || 'Error en la operación');
        }
    } catch (error) {
        console.error(error);
        mostrarError('Error de conexión');
    }
});
