const API_URL = 'http://localhost:8080/api/config/direcciones';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const direccionForm = document.getElementById('direccionForm');
    const direccionModal = new bootstrap.Modal(document.getElementById('direccionModal'));
    const addDireccionBtn = document.getElementById('addDireccionBtn');

    let currentDireccionId = null;

    if (!app) {
        console.error('App container not found!');
        return;
    }

    // Fetch and render direcciones
    async function getDirecciones() {
        try {
            const response = await fetch(API_URL);
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

    // Render direcciones table
    function renderDirecciones(direcciones) {
        app.innerHTML = ''; // Clear previous content

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
                    <th>Acciones</th>
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
                <td>
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${dir._id}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${dir._id}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        app.appendChild(table);

        // Attach event listeners for edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                editDireccion(id);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                deleteDireccion(id);
            });
        });
    }

    // Handle form submission for adding/updating a direccion
    direccionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const direccionData = {
            nombre: document.getElementById('nombre').value,
            direccion: document.getElementById('direccion').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            horario_atencion: document.getElementById('horario_atencion').value,
        };

        try {
            let response;
            if (currentDireccionId) {
                // Update existing direccion
                response = await fetch(`${API_URL}/${currentDireccionId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(direccionData),
                });
            } else {
                // Add new direccion
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(direccionData),
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            direccionModal.hide();
            direccionForm.reset();
            currentDireccionId = null;
            getDirecciones(); // Refresh the list
        } catch (error) {
            console.error('Error saving direccion:', error);
            alert('Error al guardar la dirección.');
        }
    });

    // Populate form for editing
    async function editDireccion(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const dir = await response.json();

            document.getElementById('direccionId').value = dir._id;
            document.getElementById('nombre').value = dir.nombre;
            document.getElementById('direccion').value = dir.direccion;
            document.getElementById('email').value = dir.email;
            document.getElementById('telefono').value = dir.telefono;
            document.getElementById('horario_atencion').value = dir.horario_atencion;

            currentDireccionId = dir._id;
            direccionModal.show();
        } catch (error) {
            console.error('Error fetching direccion for edit:', error);
            alert('Error al cargar la dirección para editar.');
        }
    }

    // Delete a direccion
    async function deleteDireccion(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            getDirecciones(); // Refresh the list
        } catch (error) {
            console.error('Error deleting direccion:', error);
            alert('Error al eliminar la dirección.');
        }
    }

    // Clear form when "Add New Dirección" button is clicked
    addDireccionBtn.addEventListener('click', () => {
        direccionForm.reset();
        currentDireccionId = null;
        document.getElementById('direccionId').value = '';
    });

    // Initial load
    getDirecciones();
});
