/* ---|| SOLICITUD RECUPERACION ||--- */
// Siempre se va a mostrar un mensaje generico o de exito para no revelar si existe el usuario o no, 
// a menos que sea un error de servidor claro.
// En este sistema interno, podemos ser mas explicitos si el usuario no existe.
// Si el backend devuelve error (como por ejemplo usuario no existe), lo mostramos

document.getElementById('recuperarForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const cedula = document.getElementById('cedula').value;
    const btn = e.target.querySelector('button');
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        const res = await fetch('/api/auth/solicitar-recuperacion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cedula })
        });

        const data = await res.json();
        
        if (res.ok) {
            mostrarExito('El administrador ha recibido tu solicitud. Si tus datos son correctos, se pondrán en contacto contigo.', () => {
                window.location.href = 'index.html';
            });
        } else {
            mostrarError(data.mensaje || 'Error al procesar solicitud');
        }

    } catch (error) {
        console.error(error);
        mostrarError('Error de conexión con el servidor');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
});
