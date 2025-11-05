document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    if (!app) {
        console.error('App container not found!');
        return;
    }

    const token = prompt("Por favor, ingresa tu token de autenticación (Bearer):");

    if (!token) {
        app.innerHTML = '<div class="alert alert-warning">Se necesita un token de autenticación para ver los usuarios.</div>';
        return;
    }

    async function getUsers() {
        try {
            const response = await fetch('http://localhost:8080/api/auth/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error('No autorizado. Verifica tu token.');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const users = await response.json();
            renderUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            app.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    function renderUsers(users) {
        if (!users || users.length === 0) {
            app.innerHTML = '<div class="alert alert-info">No hay usuarios para mostrar.</div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'table table-striped';

        const thead = `
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>RUT</th>
                    <th>Rol</th>
                </tr>
            </thead>
        `;
        table.innerHTML = thead;

        const tbody = document.createElement('tbody');
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.nombre}</td>
                <td>${user.apellido}</td>
                <td>${user.email}</td>
                <td>${user.rut}</td>
                <td>${user.rol}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        app.innerHTML = ''; // Clear loading message
        app.appendChild(table);
    }

    getUsers();
});
