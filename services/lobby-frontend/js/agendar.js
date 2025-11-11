document.addEventListener('DOMContentLoaded', async () => {
    const appContainer = document.getElementById('app');
    const token = localStorage.getItem('token');

    if (!token) {
        renderLoggedOutView(appContainer);
        return;
    }

    try {
        const response = await fetch('/api/auth/verify-token', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const verification = await response.json();

        if (!verification.valid) {
            localStorage.removeItem('token');
            renderLoggedOutView(appContainer);
            return;
        }

        const user = verification.user;
        renderAgendaView(appContainer, user, token);

    } catch (error) {
        console.error('Error:', error);
        renderLoggedOutView(appContainer, 'Error de conexión. Por favor, intente más tarde.');
    }
});

function renderAgendaView(container, user, token) {
    container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary w-100">
            <div class="container-fluid">
                <a class="navbar-brand" href="/">Municipalidad de Las Condes</a>
                <div class="d-flex">
                    <span class="navbar-text me-3">Hola, ${user.email}</span>
                    <button id="logout-btn" class="btn btn-danger">Cerrar Sesión</button>
                </div>
            </div>
        </nav>
        <div class="container mt-5">
            <h2>Agendar Hora</h2>
            <form id="appointment-form">
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label for="rut" class="form-label">RUT</label>
                        <input type="text" class="form-control" id="rut" required>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="nombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="nombre" required>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="apellido" class="form-label">Apellido</label>
                        <input type="text" class="form-control" id="apellido" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="procedure" class="form-label">Trámite</label>
                    <select class="form-select" id="procedure" required>
                        <option value="">Seleccione un trámite</option>
                        <!-- Options will be loaded dynamically -->
                    </select>
                    <div id="services-warning" class="form-text text-danger d-none">
                        No se pudieron cargar los trámites. Intente más tarde.
                    </div>
                </div>
                <div class="mb-3">
                    <label for="appointment-date" class="form-label">Fecha</label>
                    <input type="date" class="form-control" id="appointment-date" required>
                </div>
                <div class="mb-3">
                    <label for="appointment-time" class="form-label">Hora</label>
                    <select class="form-select" id="appointment-time" required disabled>
                        <option value="">Seleccione una fecha para ver horarios</option>
                    </select>
                    <div id="time-warning" class="form-text text-danger d-none">
                        No se pudieron cargar los horarios disponibles. Los horarios mostrados son genéricos y podrían no estar disponibles.
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Agendar</button>
            </form>
            <div id="confirmation-message" class="mt-3"></div>
        </div>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/auth/';
        });
    }

    const appointmentForm = document.getElementById('appointment-form');
    const procedureSelect = document.getElementById('procedure');
    const dateInput = document.getElementById('appointment-date');
    const timeSelect = document.getElementById('appointment-time');
    const timeWarning = document.getElementById('time-warning');
    const servicesWarning = document.getElementById('services-warning');
    const confirmationMessage = document.getElementById('confirmation-message');

    // Fetch services
    fetch('/api/appointments/services', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(async response => {
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error ${response.status}: ${text || 'No se pudo obtener la lista de trámites'}`);
        }
        return response.json();
    })
    .then(services => {
        if (!Array.isArray(services) || services.length === 0) {
            servicesWarning.classList.remove('d-none');
            servicesWarning.textContent = 'No hay trámites disponibles por el momento.';
            // Deshabilitar campos dependientes
            dateInput.disabled = true;
            timeSelect.disabled = true;
            const submitBtn = appointmentForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            return;
        }
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.nombre;
            procedureSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching services:', error);
        servicesWarning.classList.remove('d-none');
        servicesWarning.textContent = 'No se pudieron cargar los trámites. Verifique su sesión y conexión.';
        // Deshabilitar campos dependientes
        dateInput.disabled = true;
        timeSelect.disabled = true;
        const submitBtn = appointmentForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
    });

    const setDefaultTimes = () => {
        const times = [];
        for (let i = 9; i < 17; i++) {
            times.push(`${i.toString().padStart(2, '0')}:00`);
            times.push(`${i.toString().padStart(2, '0')}:30`);
        }
        timeSelect.innerHTML = '<option value="">Seleccione una hora</option>';
        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        });
        timeSelect.disabled = false;
    };

    dateInput.addEventListener('change', async () => {
        const selectedDate = dateInput.value;
        const procedureId = procedureSelect.value;
        timeWarning.classList.add('d-none');

        if (!selectedDate || !procedureId) {
            timeSelect.innerHTML = '<option value="">Seleccione un trámite y fecha</option>';
            timeSelect.disabled = true;
            return;
        }

        try {
            const response = await fetch(`/api/appointments/available-times?date=${selectedDate}&procedureId=${procedureId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }

            const availableTimes = await response.json();
            
            timeSelect.innerHTML = '<option value="">Seleccione una hora</option>';
            if (availableTimes.length > 0) {
                availableTimes.forEach(time => {
                    const option = document.createElement('option');
                    option.value = time;
                    option.textContent = time;
                    timeSelect.appendChild(option);
                });
                timeSelect.disabled = false;
            } else {
                timeSelect.innerHTML = '<option value="">No hay horas disponibles</option>';
                timeSelect.disabled = true;
            }
        } catch (error) {
            console.error('Error fetching available times:', error);
            timeWarning.classList.remove('d-none');
            setDefaultTimes();
        }
    });

    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const appointment = {
            rut: document.getElementById('rut').value,
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            procedureId: procedureSelect.value,
            date: dateInput.value,
            time: timeSelect.value,
            userId: user.id 
        };

        try {
            const response = await fetch('/api/appointments/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointment)
            });

            if (response.ok) {
                const result = await response.json();
                const fecha = result.date || (result.fecha_hora ? new Date(result.fecha_hora).toLocaleDateString() : 'fecha');
                const hora = result.time || (result.fecha_hora ? new Date(result.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'hora');
                confirmationMessage.innerHTML = `<div class="alert alert-success">Cita agendada con éxito para el ${fecha} a las ${hora}.</div>`;
                appointmentForm.reset();
                timeSelect.disabled = true;
                dateInput.disabled = false;
                const submitBtn = appointmentForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.disabled = false;
            } else {
                let errorBody = await response.text();
                try {
                    const errorJson = JSON.parse(errorBody);
                    errorBody = errorJson.message || JSON.stringify(errorJson);
                } catch (e) {
                    // Not a JSON response, use the raw text.
                }
                throw new Error(`Error del servidor: ${response.status}. Respuesta: ${errorBody}`);
            }
        } catch (error) {
            console.error('Error detallado al agendar:', error);
            confirmationMessage.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    });
}

function renderLoggedOutView(container, message = 'Debes iniciar sesión para agendar una hora.') {
    container.innerHTML = `
        <div class="container text-center mt-5">
            <h1>Acceso Requerido</h1>
            <p class="lead">${message}</p>
            <a href="/auth/?redirect=/agendar.html" class="btn btn-primary">Ir a Iniciar Sesión</a>
        </div>
    `;
}
