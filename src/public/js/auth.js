/* ---|| INICIAR SESION ||--- */
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            // Guardar token en localStorage
            localStorage.setItem('token', data.token);

            // Redirigir segun el rol
            if (data.rol === 'admin') {
                window.location.href = '/vistas/admin/panel.html';
            } else if (data.rol === 'administrativo') {
                window.location.href = '/vistas/administrativo/panel.html';
            } else {
                window.location.href = '/vistas/obrero/panel.html';
            }
        } else {
            mostrarError(data.mensaje || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error de conexión');
    }
});
