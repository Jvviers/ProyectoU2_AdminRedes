<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api/auth';

    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const authForms = document.getElementById('auth-forms');
    const profileView = document.getElementById('profile-view');
    const userDetails = document.getElementById('user-details');
    const logoutButton = document.getElementById('logout-button');

    const showLoginLink = document.getElementById('show-login');
    const showRegisterLink = document.getElementById('show-register');
    const registerFormContainer = document.getElementById('register-form-container');
    const loginFormContainer = document.getElementById('login-form-container');

    // Check for token on load
    const token = localStorage.getItem('token');
    if (token) {
        fetchUserProfile();
    }

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
    });

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            nombre: document.getElementById('register-nombre').value,
            apellido: document.getElementById('register-apellido').value,
            email: document.getElementById('register-email').value,
            rut: document.getElementById('register-rut').value,
            password: document.getElementById('register-password').value,
            telefono: document.getElementById('register-telefono').value,
        };

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                fetchUserProfile();
            } else {
                alert(`Error: ${data.error || data.errors.map(e => e.msg).join(', ')}`);
            }
        } catch (error) {
            console.error('Error en registro:', error);
            alert('Error al registrar usuario.');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginData = {
            email: document.getElementById('login-email').value,
            password: document.getElementById('login-password').value,
        };

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                fetchUserProfile();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error en login:', error);
            alert('Error al iniciar sesión.');
        }
    });

    logoutButton.addEventListener('click', async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });
        } catch (error) {
            console.error('Error on logout:', error);
        }
        localStorage.removeItem('token');
        authForms.style.display = 'block';
        profileView.style.display = 'none';
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
    });

    async function fetchUserProfile() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const user = await response.json();
            if (response.ok) {
                displayUserProfile(user);
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            localStorage.removeItem('token');
        }
    }

    function displayUserProfile(user) {
        authForms.style.display = 'none';
        profileView.style.display = 'block';
        userDetails.innerHTML = `
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Nombre:</strong> ${user.nombre} ${user.apellido || ''}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>RUT:</strong> ${user.rut}</p>
            <p><strong>Rol:</strong> ${user.rol}</p>
        `;
    }
});
=======
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
>>>>>>> Rafael
