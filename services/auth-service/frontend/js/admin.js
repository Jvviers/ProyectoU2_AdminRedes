document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const messageDiv = document.getElementById('message');
    const userListDiv = document.getElementById('user-list');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // 1. Verificar el token y el rol del usuario
        const verifyResponse = await fetch('http://localhost:8080/api/auth/verify-token', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const verification = await verifyResponse.json();
        console.log('Respuesta de verificación:', verification);

        if (!verification.valid || verification.user.rol !== 'administrador') {
            userListDiv.innerHTML = '<div class="alert alert-danger">Acceso denegado. No tienes permisos de administrador.</div>';
            return;
        }

        // 2. Si es admin, obtener la lista de usuarios
        const usersResponse = await fetch('http://localhost:8080/api/auth/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!usersResponse.ok) {
            throw new Error('Error al obtener la lista de usuarios.');
        }

        const users = await usersResponse.json();
        const userTableBody = document.getElementById('user-table-body');
        userTableBody.innerHTML = ''; // Limpiar tabla

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.nombre} ${user.apellido}</td>
                    <td>${user.email}</td>
                    <td>${user.rut}</td>
                    <td>${user.rol}</td>
                    <td>${user.activo ? 'Sí' : 'No'}</td>
                </tr>
            `;
            userTableBody.innerHTML += row;
        });

    } catch (error) {
        messageDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }

    // 3. Lógica de Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});
