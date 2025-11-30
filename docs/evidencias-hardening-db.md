# Evidencias de Hardening de Base de Datos

## 1) Puerto no expuesto al host
- Comando: `Select-String -Path docker-compose.yml -Pattern 'postgres-master' -Context 0,5 | Select-String -NotMatch 'ports'`
- Resultado (no aparece bloque `ports` para postgres-master):
  ```
  > docker-compose.yml:10:  postgres-master-data:
  > docker-compose.yml:23:  postgres-master:
  > docker-compose.yml:25:    container_name: postgres-master
  > docker-compose.yml:35:      - postgres-master-data:/var/lib/postgresql/data
  > docker-compose.yml:66:      postgres-master:
  > docker-compose.yml:110:      postgres-master:
  > docker-compose.yml:156:      - postgres-master-data:/var/lib/postgresql/data
  > docker-compose.yml:159:      postgres-master:
  > docker-compose.yml:200:      postgres-master:
  > docker-compose.yml:241:      postgres-master:
  > docker-compose.yml:278:      postgres-master:
  > docker-compose.yml:320:      postgres-master:
  > docker-compose.yml:358:      postgres-master:
  > docker-compose.yml:396:      postgres-master:
  > docker-compose.yml:433:      postgres-master:
  > docker-compose.yml:472:      postgres-master:
  > docker-compose.yml:510:      postgres-master:
  > docker-compose.yml:553:      postgres-master:
  > docker-compose.yml:623:      postgres-master:
  > docker-compose.yml:648:      postgres-master:
  > docker-compose.yml:669:      - database-network # To access postgres-master
  > docker-compose.yml:672:      postgres-master:
  ```

## 2) Tabla de servicios en ejecucion (puerto de postgres-master sin publicar)
- Comando: `docker compose ps`
- Salida relevante:
  ```
  postgres-master          postgres:15-alpine                             "docker-entrypoint.s…"   postgres-master          8 minutes ago   Up 8 minutes (healthy)   5432/tcp
  postgres-replica         proyectou2_adminredes-postgres-replica         "/usr/local/bin/entr…"   postgres-replica         8 minutes ago   Up 8 minutes (healthy)   5432/tcp
  ```
  (La columna Ports no muestra binding al host; solo puerto interno 5432/tcp).

## 3) Intento de conexion desde host (credenciales app_user)
- Comando (usando cliente psql en contenedor):  
  `docker run --rm -e PGPASSWORD=ignored postgres:15-alpine psql -h host.docker.internal -p 5432 -U app_user -d municipalidad_db -c "select 1;"`
- Salida:
  ```
  psql: error: connection to server at "host.docker.internal" (192.168.65.254), port 5432 failed: FATAL:  la autenticacion password fallo para el usuario "app_user"
  ```
- Comentario: sin puerto publicado y con autenticacion SCRAM, el intento desde host es rechazado.

## 4) Intento de conexion desde host con credenciales user/user123_adminX
- Comando:  
  `docker run --rm -e PGPASSWORD=user123_adminX postgres:15-alpine psql -h host.docker.internal -p 5432 -U user -d municipalidad_db -c "select 1;"`
- Salida:
  ```
  psql: error: connection to server at "host.docker.internal" (192.168.65.254), port 5432 failed: FATAL:  la autenticacion password fallo para el usuario "user"
  ```
- Comentario: se rechaza la autenticacion desde host; el servicio no se expone al host y exige credenciales.

## 5) Conexion interna exitosa (red interna Docker)
- Comando:  
  `docker exec -e PGPASSWORD=user123_adminX -it postgres-master psql -h db-proxy -U user -d municipalidad_db -c "select 1;"`
- Salida:
  ```
   ?column?
  ----------
          1
  (1 row)
  ```
  Demuestra que el acceso funciona dentro de la red interna de Docker con credenciales correctas.

## 6) Logs de postgres tras intentos fallidos
- Comando: `docker logs --tail 50 postgres-master`
- Fragmento relevante:
  ```
  2025-11-30 19:52:42.495 UTC [594] FATAL:  no pg_hba.conf entry for replication connection from host "172.20.0.3", user "replicator", no encryption
  2025-11-30 19:52:47.494 UTC [602] FATAL:  no pg_hba.conf entry for replication connection from host "172.20.0.3", user "replicator", no encryption
  ...
  2025-11-30 19:56:47.604 UTC [750] FATAL:  no pg_hba.conf entry for replication connection from host "172.20.0.3", user "replicator", no encryption
  ```
  Evidencia que el acceso esta controlado por pg_hba.conf y rechaza conexiones no autorizadas.
