document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = '';

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
    };

    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = `<div class="alert alert-success">Login exitoso.</div>`;
            // Guarda el token en localStorage para usarlo en futuras peticiones
            localStorage.setItem('token', result.token);
            document.getElementById('login-form').reset();
            // Opcional: Redirigir a una página de perfil o al lobby
            // window.location.href = 'http://localhost:8083'; // Redirigir al lobby
        } else {
            const errorMsg = result.errors ? result.errors.map(e => e.msg).join(', ') : (result.error || 'Error al iniciar sesión.');
            throw new Error(errorMsg);
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
});
