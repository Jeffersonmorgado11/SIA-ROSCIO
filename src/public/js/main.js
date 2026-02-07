/* ---|| LOGICA GLOBAL ||--- */

// Manejo del cierre de sesión
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.mostrarConfirmacion === 'function') {
                window.mostrarConfirmacion('¿Estás seguro de que deseas cerrar sesión?', () => {
                    realizarLogout();
                });
            } else {
                realizarLogout();
            }
        });
    }

    inicializarSidebar();
    cargarModalesComunes();
});

function realizarLogout() {
    localStorage.removeItem('token');
    window.location.href = '/index.html';
}

function inicializarSidebar() {
    let sidebar = document.querySelector(".barra-lateral");
    let sidebarBtn = document.getElementById("toggleSidebar");
    let mobileMenuBtn = document.getElementById("btnMenuSidebar");
    
    if (sidebarBtn && sidebar) {
        let sidebarIcon = sidebarBtn.querySelector("img");
        sidebarBtn.onclick = function (e) {
            e.preventDefault();
            if (window.innerWidth <= 1000) {
                 sidebar.classList.remove("barra-lateral--movil-activa");
            } else {
                 sidebar.classList.toggle("barra-lateral--colapsada");
            }

            if (sidebarIcon && window.innerWidth > 1000) {
                if (sidebar.classList.contains("barra-lateral--colapsada")) {
                    sidebarIcon.src = "../../img/icons/layout-sidebar-left-expand.svg";
                } else {
                    sidebarIcon.src = "../../img/icons/layout-sidebar-left-collapse.svg";
                }
            }
        }
    }

    // Para resoluciones menores
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.onclick = function (e) {
            e.preventDefault();
            sidebar.classList.toggle("barra-lateral--movil-activa");
        }
    }

    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickInsideMobileBtn = mobileMenuBtn ? mobileMenuBtn.contains(event.target) : false;
        
        if (window.innerWidth <= 1000 && 
            sidebar.classList.contains('barra-lateral--movil-activa') && 
            !isClickInsideSidebar && 
            !isClickInsideMobileBtn) {
            
            sidebar.classList.remove('barra-lateral--movil-activa');
        }
    });
}

/* ---|| TOGGLE CONTRASEÑA ||--- */
document.addEventListener('DOMContentLoaded', () => {
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');

    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const input = this.previousElementSibling;
            
            if (input && input.tagName === 'INPUT') {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);

                if (type === 'password') {
                    this.setAttribute('src', 'img/icons/eye.svg');
                    this.setAttribute('alt', 'eye-off');
                } else {
                    this.setAttribute('src', 'img/icons/eye-off.svg');
                    this.setAttribute('alt', 'eye');
                }
            }
        });
    });
});


/* ---|| GLOBALES ||--- */

let modalCallback = null;
let modalesCargados = false;

/* ---|| MODALES DINAMICOS ||--- */
async function cargarModalesComunes() {
    if (modalesCargados) return;
    try {
        const response = await fetch('/components/modales.html');
        if (response.ok) {
            const html = await response.text();
            document.body.insertAdjacentHTML('beforeend', html);
            modalesCargados = true;
            
            configurarFormularioPassword();
        } else {
            console.error('Error cargando modales comunes:', response.status);
        }
    } catch (error) {
        console.error('Error de red al cargar modales:', error);
    }
}

/* ---|| FORMULARIO CONTRASEÑA ||--- */
function configurarFormularioPassword() {
    const form = document.getElementById('formPassword');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const actual = document.getElementById('passwordActual').value;
            const nuevo = document.getElementById('passwordNuevo').value;
            const confirmar = document.getElementById('passwordConfirmar').value;

            if (nuevo !== confirmar) {
                mostrarError('Las contraseñas nuevas no coinciden');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/auth/cambiar-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({ passwordActual: actual, passwordNuevo: nuevo })
                });

                const data = await res.json();
                if (res.ok) {
                    cerrarModal('modalPassword');
                    mostrarExito('Contraseña actualizada correctamente');
                    form.reset();
                } else {
                    mostrarError(data.mensaje || 'Error al actualizar');
                }
            } catch (error) {
                mostrarError('Error de conexión');
            }
        });
    }

    const btnSidebar = document.getElementById('btnCambiarPasswordSidebar');
    if (btnSidebar) {
        btnSidebar.onclick = (e) => {
            e.preventDefault();
            const modal = document.getElementById('modalPassword');
            if (modal) {
                modal.style.display = 'block';
                document.getElementById('formPassword').reset();
            } else {
                console.warn('Modal password no encontrado aún');
            }
        };
    }
}

/* ---|| FUNCIONES MODALES ||--- */
window.mostrarModal = (titulo, mensaje, tipo = 'info', callback = null) => {
    const modal = document.getElementById('modalMensaje');
    if (!modal) {
        console.warn('El modal #modalMensaje no está listo. Reintentando en 100ms...');
        setTimeout(() => window.mostrarModal(titulo, mensaje, tipo, callback), 100);
        return;
    }

    const h2 = document.getElementById('modalTitulo');
    const p = document.getElementById('modalTexto');
    const divBotones = document.getElementById('modalBotones');
    const iconoContainer = document.querySelector('#modalMensaje .modal__encabezado-icono');

    if (h2) h2.textContent = titulo;
    if (p) p.textContent = mensaje;
    if (divBotones) divBotones.innerHTML = '';

    // Manejo de iconos SVG
    if (iconoContainer) {
        iconoContainer.innerHTML = '';
        iconoContainer.className = 'modal__encabezado-icono';
        
        const img = document.createElement('img');
        img.style.width = '35px';
        img.style.height = '35px';
        img.style.filter = 'invert(1)';

        let iconName = 'bell.svg';

        if (tipo === 'success') {
            iconoContainer.classList.add('modal__encabezado-icono--secundario');
            iconName = 'circle-check.svg';
        } else if (tipo === 'error') {
            iconoContainer.classList.add('modal__encabezado-icono--peligro');
            iconName = 'xbox-x.svg';
        } else if (tipo === 'confirm') {
            iconoContainer.classList.add('modal__encabezado-icono--primario');
            iconName = 'progress-alert.svg';
        } else {
            iconoContainer.classList.add('modal__encabezado-icono--secundario');
        }

        img.src = `/img/icons/${iconName}`;
        iconoContainer.appendChild(img);
    }

    modalCallback = callback;

    if (divBotones) {
        if (tipo === 'confirm') {
            const btnCancelar = document.createElement('button');
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.className = 'boton boton--secundario';
            btnCancelar.onclick = () => window.cerrarModal();

            const btnAceptar = document.createElement('button');
            btnAceptar.textContent = 'Aceptar';
            btnAceptar.className = 'boton boton--primario';
            btnAceptar.onclick = () => {
                if (modalCallback) modalCallback();
                window.cerrarModal();
            };

            divBotones.appendChild(btnCancelar);
            divBotones.appendChild(btnAceptar);
        } else {
            const btnOk = document.createElement('button');
            btnOk.textContent = 'Entendido';
            btnOk.className = 'boton boton--primario';
            btnOk.onclick = () => {
                if (modalCallback) modalCallback();
                window.cerrarModal();
            };
            divBotones.appendChild(btnOk);
        }
    }
    
    modal.style.display = 'block';

    window.onclick = function(event) {
        if (event.target == modal) {
           window.cerrarModal();
        }
    }
};

window.cerrarModal = (id = 'modalMensaje') => {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
    modalCallback = null;
};

/* ---|| ELEMENTOS DE LOS MODALES ||--- */

// Mensajes
window.mostrarExito = (mensaje, callback) => window.mostrarModal('¡Éxito!', mensaje, 'success', callback);
window.mostrarError = (mensaje, callback) => window.mostrarModal('Error', mensaje, 'error', callback);

// Confirmacion con Modal
window.mostrarConfirmacion = (mensaje, callback) => {
    const modalConf = document.getElementById('modalConfirmacion');
    if (modalConf) {
        document.getElementById('mensajeConfirmacionTexto').textContent = mensaje;
        const btnAceptar = document.getElementById('btnConfirmarAccion');
        
        const nuevoBtn = btnAceptar.cloneNode(true);
        btnAceptar.parentNode.replaceChild(nuevoBtn, btnAceptar);
        
        nuevoBtn.onclick = () => {
            if (callback) callback();
            cerrarModal('modalConfirmacion');
        };

        window.cerrarModalConfirmacion = () => cerrarModal('modalConfirmacion');
        modalConf.style.display = 'block';
    } else {
        window.mostrarModal('Confirmar Acción', mensaje, 'confirm', callback);
    }
};

// Exito con Modal
window.mostrarExitoModal = (mensaje) => {
    const modalEx = document.getElementById('modalExito');
    if (modalEx) {
        document.getElementById('mensajeExitoTexto').textContent = mensaje;
        window.cerrarModalExito = () => cerrarModal('modalExito');
        modalEx.style.display = 'block';
    } else {
        window.mostrarExito(mensaje);
    }
};
