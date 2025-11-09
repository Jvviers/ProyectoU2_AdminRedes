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
            localStorage.setItem('token', result.token);
            window.location.href = '/'; // Redirigir siempre al lobby
        } else {
            const errorMsg = result.errors ? result.errors.map(e => e.msg).join(', ') : (result.error || 'Error al iniciar sesión.');
            throw new Error(errorMsg);
        }
    } catch (error) {
        messageDiv.innerHTML = '<div class="alert alert-danger">' + error.message + '</div>';
    }
});