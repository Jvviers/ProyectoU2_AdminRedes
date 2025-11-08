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
                renderAdminView(appContainer, user);
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

function renderAdminView(container, user) {
    container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Municipalidad de Las Condes</a>
                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Gestión de Usuarios</a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="/auth/register.html" target="_blank">Registrar Usuario</a></li>
                                <li><a class="dropdown-item" href="/auth/admin.html" target="_blank">Lista de Usuarios</a></li>
                            </ul>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Configuraciones</a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="/config/" target="_blank">Administración de Direcciones</a></li>
                            </ul>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Monitoreo</a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="http://localhost:9090" target="_blank">Prometheus</a></li>
                                <li><a class="dropdown-item" href="http://localhost:3010" target="_blank">Grafana</a></li>
                            </ul>
                        </li>
                    </ul>
                    <span class="navbar-text me-3">Hola, ${user.email}</span>
                    <button id="logout-btn" class="btn btn-danger">Cerrar Sesión</button>
                </div>
            </div>
        </nav>
        <div class="container text-center mt-5">
            <h1>Bienvenido al Panel de Administración</h1>
            <p class="lead">Selecciona una opción de la barra de navegación para comenzar.</p>
        </div>
    `;
}

function renderFuncionarioView(container, user) {
    container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Municipalidad de Las Condes</a>
                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Configuraciones</a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="/config/" target="_blank">Administración de Direcciones</a></li>
                            </ul>
                        </li>
                    </ul>
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
}

function renderCiudadanoView(container, user) {
    container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
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