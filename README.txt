README - Instrucciones de Inicio del Proyecto

Este documento proporciona las instrucciones para iniciar el proyecto utilizando Docker Compose.

1.  Requisitos Previos:
    Asegúrate de tener Docker y Docker Compose instalados en tu sistema.

2.  Iniciar el Proyecto:
    a.  Navega a la raíz del directorio del proyecto en tu terminal.
        cd C:\Users\usuario\Documents\GitHub\ProyectoU2_AdminRedes

    b.  Detén y elimina cualquier contenedor Docker antiguo que pueda estar ejecutándose y que pertenezca a este proyecto. Esto asegura un inicio limpio.
        docker-compose down

    c.  Construye las imágenes de Docker (si hay cambios o es la primera vez) y levanta todos los servicios en modo detached (segundo plano).
        docker-compose up -d --build

3.  Verificar el Estado de los Servicios:
    Puedes verificar el estado de los contenedores Docker en ejecución con el siguiente comando:
        docker-compose ps

    Asegúrate de que todos los servicios estén en estado 'Up' o 'healthy'.

4.  Acceso a los Servicios:
    Los servicios del proyecto estarán accesibles en los siguientes puertos (si están expuestos en tu configuración de Docker Compose):
    -   Auth Service: http://localhost:3000
    -   Appointment Service: http://localhost:3001
    -   Config Service: http://localhost:3002
    -   PostgreSQL: Puerto 5432
    -   Redis: Puerto 6379

¡Listo! El proyecto debería estar funcionando.