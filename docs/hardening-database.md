# Hardening de la Base de Datos (PostgreSQL)

## Objetivo
Aplicar controles de seguridad para la base de datos: aislamiento de red, autenticación robusta, privilegios mínimos y logging de accesos/errores.

## Medidas aplicadas
- **Aislamiento de red:** servicio `db-proxy` sin puerto expuesto al host; la BD solo es accesible por la red interna `proyectou2_adminredes_database-network`.
- **Reglas pg_hba:** limitadas a la CIDR `172.21.0.0/16`; superusuario solo local (`local`), bloqueado por red; roles de réplica y app obligan `scram-sha-256`.
- **Autenticación:** `password_encryption = scram-sha-256`; usuario de app definido por env (`APP_DB_USER`, `APP_DB_PASSWORD` ≥12 chars) sin SUPERUSER/CREATEDB/CREATEROLE/REPLICATION.
- **Privilegios mínimos:** revocado CREATE/TEMP en DB para PUBLIC; rol de app solo tiene SELECT/INSERT/UPDATE/DELETE en `public` (actuales y futuros objetos).
- **Logging:** `log_connections`, `log_disconnections`, `log_duration` habilitados; `log_line_prefix` con timestamp/usuario/DB/host/PID; logs a stderr para captura por Docker.

## Archivos relevantes
- `docker-compose.yml`: sin puerto expuesto de DB; servicios de app usan `APP_DB_USER`/`APP_DB_PASSWORD`; pasa vars a Postgres.
- `infrastructure/database/hardening.sql`: crea rol mínimo de app, valida longitud de contraseña, revoca privilegios y otorga solo CRUD.
- `infrastructure/database/master.conf`: parámetros de logging y `password_encryption = scram-sha-256`.
- `infrastructure/database/pg-hba-fixer.sh`: inserta reglas pg_hba.conf endurecidas (CIDR interna, bloqueo de superusuario por red, scram).

## Uso y despliegue
1. Definir en `.env`:
   - `APP_DB_USER` (ej. `user`)
   - `APP_DB_PASSWORD` (mínimo 12 caracteres, ej. `user123_adminX`)
   - `DB_USER`/`DB_PASSWORD` reservados para administración/backups/replicación.
2. Levantar la pila: `docker-compose up -d`.
3. Verificar que el rol de app existe y permisos mínimos:
   ```sh
   docker exec -it postgres-master psql -U "$DB_USER" -d "$DB_NAME" -c "\\du"
   docker exec -it postgres-master psql -U "$DB_USER" -d "$DB_NAME" -c "SHOW password_encryption;"
   ```

## Verificación de aislamiento
- Prueba desde host (debe fallar al no existir puerto expuesto):
  ```sh
  psql -h localhost -p 5433 -U "$APP_DB_USER" -d "$DB_NAME"
  ```
  Resultado esperado: error de conexión (no route / connection refused) porque no hay binding al host.
- Prueba interna (desde contenedor de app o postgres):
  ```sh
  docker exec -it postgres-master psql -h db-proxy -p 5432 -U "$APP_DB_USER" -d "$DB_NAME" -c "SELECT 1;"
  ```

## Logging / auditoría
- Logs de conexiones/desconexiones y duración disponibles en `docker logs postgres-master`.
- Formato incluye timestamp, PID, usuario, base de datos, host: `log_line_prefix = '%m [%p] %u@%d %h '`.

## Notas adicionales
- Si necesitas rate limiting de conexiones, ajustar `max_connections` en `master.conf` o añadir límites en HAProxy (db-proxy).
- La regla de red en `pg-hba-fixer.sh` usa `172.21.0.0/16`; si cambia la subred de Docker, actualizar `DB_CIDR` en el entorno.
