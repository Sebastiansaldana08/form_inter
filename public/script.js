// Manejar el inicio de sesión
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Guardar el email del operador en sessionStorage
    sessionStorage.setItem('operadorEmail', email);
    mostrarFormulario();
});

// Manejar el envío del formulario
document.getElementById('form-interno').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const operadorEmail = sessionStorage.getItem('operadorEmail');
    formData.append('operador', operadorEmail);

    try {
        const response = await fetch('/formulario-interno', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            window.location.href = '/confirmacion.html';
        } else {
            mostrarMensajeError('Error al enviar el formulario. Inténtelo de nuevo.');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensajeError('Error al enviar el formulario. Inténtelo de nuevo.');
    }
});

function mostrarFormulario() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('form-section').style.display = 'block';
}

function mostrarLogin() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('form-section').style.display = 'none';
}

function registrarNuevoCaso() {
    mostrarFormulario();
}

function cerrarSesion() {
    sessionStorage.removeItem('operadorEmail');
    window.location.href = '/';
}

function mostrarMensajeError(mensaje) {
    const mensajeEstado = document.getElementById('mensaje-estado');
    mensajeEstado.textContent = mensaje;
    mensajeEstado.style.color = 'red';
}

document.addEventListener('DOMContentLoaded', () => {
    const operadorEmail = sessionStorage.getItem('operadorEmail');
    if (operadorEmail) {
        mostrarFormulario();
    } else {
        mostrarLogin();
    }
});



