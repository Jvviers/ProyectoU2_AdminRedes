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
                renderCiudadanoView(appContainer, user);
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
                            <li><a class="dropdown-item" href="http://localhost:3000" target="_blank">Agendar</a></li>
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

function renderCiudadanoView(container, user) {
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
        </div>
    `;
    addLogoutListener(); // Re-attach listener after innerHTML update
}

function renderLoggedOutView(container, message = 'Debes iniciar sesión para acceder a esta página.') {
    container.innerHTML = `
        <div class="container text-center mt-5">
            <h1>Acceso Requerido</h1>
            <p class="lead">${message}</p>
            <a href="/auth/" class="btn btn-primary">Ir a Iniciar Sesión</a>
        </div>
    `;
}