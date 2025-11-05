document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    if (!app) {
        console.error('App container not found!');
        return;
    }

    async function getDirecciones() {
        try {
            const response = await fetch('http://localhost:8080/api/config/direcciones');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const direcciones = await response.json();
            renderDirecciones(direcciones);
        } catch (error) {
            console.error('Error fetching direcciones:', error);
            app.innerHTML = '<div class="alert alert-danger">Error al cargar las direcciones.</div>';
        }
    }

    function renderDirecciones(direcciones) {
        if (!direcciones || direcciones.length === 0) {
            app.innerHTML = '<div class="alert alert-info">No hay direcciones para mostrar.</div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'table table-striped';

        const thead = `
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Horario</th>
                </tr>
            </thead>
        `;
        table.innerHTML = thead;

        const tbody = document.createElement('tbody');
        direcciones.forEach(dir => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dir.nombre}</td>
                <td>${dir.direccion}</td>
                <td>${dir.email}</td>
                <td>${dir.telefono}</td>
                <td>${dir.horario_atencion}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        app.appendChild(table);
    }

    getDirecciones();
});
