# Logging de Seguridad

## Qué se registra
- Gateway (Nginx): accesos/denegados, 401/403, método/URI/UA, etiquetado como `job=security-gateway`.
- Servicios app (auth/config/appointment/queue/notification/statistics/ai): logs etiquetados `job=security-app` (intentos de login, errores de autorización, etc., si la app los emite).
- DB/proxy: se pueden filtrar por `service="db-proxy"`, `service="postgres-master"`, etc.

## Configuración
- `docker-compose.yml`: servicios de aplicación y gateway tienen `labels.logging_jobname` para clasificar en Loki.
- `infrastructure/monitoring/promtail/promtail-config.yml`: añade labels `service` y pipelines:
  - `job=security-gateway`: parsea access log y mantiene 401/403.
  - `job=security-app`: parsea JSON básico con labels `level`, `status`, `path`, `user` si la app loguea en JSON.

## Consultar logs
- Script: `scripts/security/query-logs.sh`
  - Usa `LOKI_URL` (default `http://localhost:3100`).
  - Uso: `scripts/security/query-logs.sh '{job="security-gateway"} |= "403"'`
  - Ajusta `LIMIT=200` si necesitas más líneas.

## Ejemplos de queries
- 401/403 del gateway: `{job="security-gateway"} |= "403"`
- Intentos de login: `{job="security-app"} |= "login"`
- Accesos a endpoints sensibles: `{job="security-gateway"} |= "/api/admin"`
- Conexiones DB (según logs): `{service="db-proxy"}`

## Notas/pendinges
- Para apps, usar formato JSON con campos `level`, `message`, `status`, `path`, `user`, `event` para aprovechar las labels.
- En nginx (frontends/gateway) se ejecuta como root para evitar el fallo de `chown` en `/var/cache/nginx`; endurecer montando tmpfs o imagen derivada con permisos precreados si quieres volver a no-root.
