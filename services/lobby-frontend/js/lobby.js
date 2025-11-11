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
        switch (user.rol) {
            case 'administrador':
                renderAdminView(appContainer, user, token);
                break;
            case 'funcionario':
                renderFuncionarioView(appContainer, user);
                break;
            case 'ciudadano':
                renderCiudadanoView(appContainer, user, token);
                break;
            default:
                renderLoggedOutView(appContainer);
        }

        addLogoutListener();

    } catch (error) {
        console.error('Error:', error);
        renderLoggedOutView(appContainer, 'Error de conexión. Por favor, intente más tarde.');
    }
});

function addLogoutListener() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/auth/';
        });
    }
}

function renderAdminView(container, user, token) {
    container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary w-100">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Municipalidad de Las Condes</a>              
                <div class="d-flex">
                    <span class="navbar-text me-3">Hola, ${user.email}</span>
                    <button id="logout-btn" class="btn btn-danger">Cerrar Sesión</button>
                </div>
            </div>
        </nav>
        <div class="d-flex w-100">
            <div class="sidebar bg-light p-3">
                <h5 class="mb-3">Navegación</h5>
                <ul class="nav flex-column">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Monitoreo</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="http://localhost:9090" target="_blank">Prometheus</a></li>
                            <li><a class="dropdown-item" href="http://localhost:3010" target="_blank">Grafana</a></li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Dierecciones</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="http://localhost" target="_blank">Direccion</a></li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Agendar Hora</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="/agendar.html" target="_blank">Agendar</a></li>
                        </ul>
                    </li>
                    
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Gestión de Usuarios</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="/auth/register.html" target="_blank">Registrar Usuario</a></li>
                            <li><a class="dropdown-item" href="/auth/admin.html" target="_blank">Lista de Usuarios</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div class="main-content flex-grow-1 p-3">
                <h1 class="mb-4">Bienvenido al Panel de Administración</h1>
                <p class="lead">Selecciona una opción del menú lateral para comenzar.</p>
                <!-- Dynamic content will be loaded here -->
                <div id="dashboard-content">
                    <h3>Resumen del Sistema</h3>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="card text-white bg-info mb-3">
                                <div class="card-header">Usuarios Registrados</div>
                                <div class="card-body">
                                    <h5 class="card-title">Cargando...</h5>
                                    <p class="card-text">Total de usuarios en el sistema.</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card text-white bg-success mb-3">
                                <div class="card-header">Citas Pendientes</div>
                                <div class="card-body">
                                    <h5 class="card-title">Cargando...</h5>
                                    <p class="card-text">Citas programadas para hoy.</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card text-white bg-warning mb-3">
                                <div class="card-header">Direcciones Registradas</div>
                                <div class="card-body">
                                    <h5 class="card-title">Cargando...</h5>
                                    <p class="card-text">Ubicaciones de servicio.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    addLogoutListener(); // Re-attach listener after innerHTML update
    fetchDashboardData(token); // Fetch data for the dashboard
}

async function fetchDashboardData(token) {
    const userCountCardTitle = document.querySelector('#dashboard-content .card.bg-info .card-title');
    const userCountCardText = document.querySelector('#dashboard-content .card.bg-info .card-text');

    if (userCountCardTitle) {
        userCountCardTitle.textContent = 'Cargando...';
    }
    if (userCountCardText) {
        userCountCardText.textContent = 'Obteniendo total de usuarios...';
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        if (userCountCardTitle) {
            userCountCardTitle.textContent = users.length;
        }
        if (userCountCardText) {
            userCountCardText.textContent = `Total de usuarios registrados.`;
        }
    } catch (error) {
        console.error('Error fetching user count:', error);
        if (userCountCardTitle) {
            userCountCardTitle.textContent = 'Error';
        }
        if (userCountCardText) {
            userCountCardText.textContent = 'No se pudo cargar.';
        }
    }

    // Fetch and update Direcciones Registradas count
    const direccionesCountCardTitle = document.querySelector('#dashboard-content .card.bg-warning .card-title');
    const direccionesCountCardText = document.querySelector('#dashboard-content .card.bg-warning .card-text');

    if (direccionesCountCardTitle) {
        direccionesCountCardTitle.textContent = 'Cargando...';
    }
    if (direccionesCountCardText) {
        direccionesCountCardText.textContent = 'Obteniendo total de direcciones...';
    }

    try {
        const response = await fetch('http://localhost:8080/api/config/direcciones', {
            headers: {
                'Authorization': `Bearer ${token}` // Assuming config-service also requires auth
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const direcciones = await response.json();
        if (direccionesCountCardTitle) {
            direccionesCountCardTitle.textContent = direcciones.length;
        }
        if (direccionesCountCardText) {
            direccionesCountCardText.textContent = `Total de direcciones registradas.`;
        }
    } catch (error) {
        console.error('Error fetching direcciones count:', error);
        if (direccionesCountCardTitle) {
            direccionesCountCardTitle.textContent = 'Error';
        }
        if (direccionesCountCardText) {
            direccionesCountCardText.textContent = 'No se pudo cargar.';
        }
    }

    // Fetch and update Citas Pendientes count
    const citasPendientesCardTitle = document.querySelector('#dashboard-content .card.bg-success .card-title');
    const citasPendientesCardText = document.querySelector('#dashboard-content .card.bg-success .card-text');

    if (citasPendientesCardTitle) {
        citasPendientesCardTitle.textContent = 'Cargando...';
    }
    if (citasPendientesCardText) {
        citasPendientesCardText.textContent = 'Obteniendo citas pendientes...';
    }

    try {
        const response = await fetch('http://localhost:8080/api/appointments/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const appointments = await response.json();
        const pendingAppointments = appointments.filter(app => app.estado === 'pendiente' || app.estado === 'confirmado');
        
        if (citasPendientesCardTitle) {
            citasPendientesCardTitle.textContent = pendingAppointments.length;
        }
        if (citasPendientesCardText) {
            citasPendientesCardText.textContent = `Citas pendientes y confirmadas.`;
        }
    } catch (error) {
        console.error('Error fetching pending appointments count:', error);
        if (citasPendientesCardTitle) {
            citasPendientesCardTitle.textContent = 'Error';
        }
        if (citasPendientesCardText) {
            citasPendientesCardText.textContent = 'No se pudo cargar.';
        }
    }
}

function renderFuncionarioView(container, user) {
    container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary w-100">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Municipalidad de Las Condes</a>
                <div class="d-flex">
                    <span class="navbar-text me-3">Hola, ${user.email}</span>
                    <button id="logout-btn" class="btn btn-danger">Cerrar Sesión</button>
                </div>
            </div>
        </nav>
        <div class="container mt-5">
            <h2>Panel de Funcionario</h2>
            <p>Acceso a la configuración del sistema.</p>
        </div>
    `;
    addLogoutListener(); // Re-attach listener after innerHTML update
}

function renderCiudadanoView(container, user, token) {
    container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary w-100">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Municipalidad de Las Condes</a>
                <div class="ms-auto">
                    <span class="navbar-text me-3">Hola, ${user.email}</span>
                    <button id="logout-btn" class="btn btn-danger">Cerrar Sesión</button>
                </div>
            </div>
        </nav>
        <div class="container mt-5">
            <h2>Bienvenido Ciudadano</h2>
            <p>Has iniciado sesión correctamente.</p>
            <div class="list-group">
              <a href="/agendar.html" class="list-group-item list-group-item-action">
                Agendar una nueva hora
              </a>
              <a href="#" id="my-appointments-link" class="list-group-item list-group-item-action">Mis horas agendadas</a>
            </div>
        </div>
    `;
    addLogoutListener(); // Re-attach listener after innerHTML update
    const myAppointmentsLink = document.getElementById('my-appointments-link');
    if (myAppointmentsLink) {
        myAppointmentsLink.addEventListener('click', (e) => {
            e.preventDefault();
            renderMyAppointmentsView(container, user, token);
        });
    }
}

async function renderMyAppointmentsView(container, user, token) {
    container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary w-100">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Municipalidad de Las Condes</a>
                <div class="ms-auto">
                    <span class="navbar-text me-3">Hola, ${user.email}</span>
                    <button id="logout-btn" class="btn btn-danger">Cerrar Sesión</button>
                </div>
            </div>
        </nav>
        <div class="container mt-5">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2>Mis horas agendadas</h2>
                <button id="back-to-home" class="btn btn-outline-secondary">Volver</button>
            </div>
            <div id="appointments-container" class="list-group">
                <div class="list-group-item">Cargando mis horas...</div>
            </div>
        </div>
    `;
    addLogoutListener();
    const backBtn = document.getElementById('back-to-home');
    if (backBtn) backBtn.addEventListener('click', () => renderCiudadanoView(container, user, token));

    try {
        const resp = await fetch('/api/appointments/my-appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const list = document.getElementById('appointments-container');
        if (!resp.ok) {
            const txt = await resp.text();
            list.innerHTML = `<div class="list-group-item text-danger">Error al cargar: ${resp.status} ${txt}</div>`;
            return;
        }
        const apps = await resp.json();
        if (!Array.isArray(apps) || apps.length === 0) {
            list.innerHTML = '<div class="list-group-item">No tienes horas agendadas.</div>';
            return;
        }
        list.innerHTML = '';
        apps.forEach(app => {
            const fecha = app.fecha_hora ? new Date(app.fecha_hora) : null;
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Servicio: ${app.servicio_id}</h6>
                    <small>${fecha ? fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</small>
                </div>
                <p class="mb-1">Estado: ${app.estado}</p>
                <small>Tipo: ${app.tipo}</small>
            `;
            list.appendChild(item);
        });
    } catch (err) {
        const list = document.getElementById('appointments-container');
        list.innerHTML = `<div class="list-group-item text-danger">Error inesperado: ${err.message}</div>`;
    }
}

function renderLoggedOutView(container, message = 'Bienvenido al portal de la Municipalidad de Las Condes.') {
    container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary w-100">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Municipalidad de Las Condes</a>
                <div class="d-flex">
                    <a href="/auth/" class="btn btn-light">Iniciar Sesión</a>
                </div>
            </div>
        </nav>
        <div class="container mt-5">
            <div class="p-5 mb-4 bg-light rounded-3">
                <div class="container-fluid py-5">
                    <h1 class="display-5 fw-bold">Portal de Trámites</h1>
                    <p class="col-md-8 fs-4">${message}</p>
                </div>
            </div>

            <div class="row align-items-md-stretch">
                <div class="col-md-6">
                    <div class="h-100 p-5 text-bg-dark rounded-3">
                        <h2>Agendar Hora</h2>
                        <p>Agenda tu hora para realizar trámites de forma presencial en nuestras oficinas.</p>
                        <a href="/auth/?redirect=/agendar.html" class="btn btn-outline-light">Agendar ahora</a>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="h-100 p-5 bg-light border rounded-3">
                        <h2>Otros Trámites</h2>
                        <p>Consulta información sobre otros trámites y servicios disponibles en la municipalidad.</p>
                        <button class="btn btn-outline-secondary" type="button">Ver más</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
