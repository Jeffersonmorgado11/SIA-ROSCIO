/* ---|| VARIABLES GLOBALES ||--- */
const formCedula = document.getElementById('formCedula');
const formRegistro = document.getElementById('formRegistro');

/* ---|| VERIFICAR CEDULA ||--- */
formCedula.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cedula = document.getElementById('cedulaCheck').value.trim();

    if (!cedula) return mostrarError('Ingrese su cédula');

    try {
        const res = await fetch('/api/auth/verificar-cedula', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('cedulaFinal').value = cedula;
            document.getElementById('lblNombre').textContent = `${data.datos.nombre} ${data.datos.apellido}`;
            document.getElementById('lblCargo').textContent = data.datos.cargo;

            formCedula.style.display = 'none';
            formRegistro.style.display = 'block';
            formRegistro.classList.add('fade-in');
        } else {
            mostrarError(data.mensaje || 'Error verificando cédula');
        }

    } catch (error) {
        console.error(error);
        mostrarError('Error de conexión');
    }
});

/* ---|| VOLVER A PASO  ||--- */
function volverPaso1() {
    formRegistro.style.display = 'none';
    formCedula.style.display = 'block';
}

/* ---|| COMPLETAR REGISTRO ||--- */
formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cedula = document.getElementById('cedulaFinal').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        return mostrarError('Las contraseñas no coinciden');
    }

    try {
        const res = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            mostrarExito('Registro exitoso. Bienvenido.', () => {
                localStorage.setItem('token', data.token);
                window.location.href = 'vistas/administrativo/panel.html';
            });
        } else {
            mostrarError(data.mensaje || 'Error al registrar');
        }

    } catch (error) {
        console.error(error);
        mostrarError('Error de conexión');
    }
});
