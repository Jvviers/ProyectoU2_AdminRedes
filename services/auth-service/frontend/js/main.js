document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = '';

    const formData = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('email').value,
        rut: document.getElementById('rut').value,
        password: document.getElementById('password').value,
        telefono: document.getElementById('telefono').value,
    };

    try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = `<div class="alert alert-success">Usuario registrado exitosamente. Token: ${result.token}</div>`;
            document.getElementById('register-form').reset();
        } else {
            const errorMsg = result.errors ? result.errors.map(e => e.msg).join(', ') : (result.message || 'Error al registrar.');
            throw new Error(errorMsg);
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
});
