README - Instrucciones de Inicio del Proyecto

Este documento proporciona las instrucciones para iniciar el proyecto completo utilizando Docker Compose.

**IMPORTANTE:** Utiliza el archivo docker-compose.yml que se encuentra en la carpeta `proyecto/`.

1.  Requisitos Previos:
    Asegúrate de tener Docker y Docker Compose instalados en tu sistema.

2.  Iniciar el Proyecto:
    a.  Navega a la carpeta `proyecto` en tu terminal.
        cd C:\Users\usuario\Documents\GitHub\ProyectoU2_AdminRedes\proyecto

    b.  Detén y elimina cualquier contenedor Docker antiguo que pueda estar ejecutándose.
        docker-compose down

    c.  Construye las imágenes y levanta todos los servicios en modo detached (segundo plano).
        docker-compose up -d --build

3.  Verificar el Estado de los Servicios:
    Desde la carpeta `proyecto/`, puedes verificar el estado de los contenedores con:
        docker-compose ps

    Asegúrate de que todos los servicios estén en estado 'Up' o 'healthy'.

4.  Acceso a los Servicios:
    Una vez que todos los contenedores estén en funcionamiento, podrás acceder a los diferentes servicios a través de las siguientes URLs:

    **Interfaces de Usuario (Frontend):**
    -   Lobby Frontend: http://localhost:8083
    -   Auth Frontend: http://localhost:8082
    -   Config Frontend: http://localhost:8081

    **API Gateway (Punto de entrada para APIs):**
    -   URL Base: http://localhost:8080
    -   Ruta de Autenticación: http://localhost:8080/api/auth/
    -   Ruta de Configuración: http://localhost:8080/api/config/
    -   Ruta de Citas: http://localhost:8080/api/appointments/

    **Herramientas de Monitoreo:**
    -   Prometheus: http://localhost:9090
    -   Grafana: http://localhost:3010

    **Bases de Datos y Servicios Internos:**
    -   PostgreSQL (via HAProxy): localhost:5433
        - Uso interno entre contenedores: `db-proxy:5432`
        - El contenedor `postgres-master` ya no expone 5432 al host; todo acceso externo debe ir por el proxy.
    -   Redis: localhost:6379

¡Listo! El proyecto debería estar funcionando.
