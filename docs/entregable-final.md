# Entregable Unidad 3 - Seguridad y Hardening

## HTTPS/TLS
- Cert dev autofirmado: `scripts/security/generate-dev-cert.sh` -> `services/api-gateway/certs/`.
- Gateway fuerza redireccion 80 -> 443, TLS, headers (HSTS, X-Frame-Options, X-Content-Type-Options, CSP).
- CSP ajustada para permitir scripts HTTPS y mantener dropdowns.
- Acceso: `https://localhost:8443` (o `https://dev.local:8443`).

## WAF / Rate Limiting (evidencias)
- Configuracion: `services/api-gateway/nginx.conf` (`limit_req` 10 r/s burst 20, bloqueo UA comun, logs a stdout/stderr).
- Logs en Loki/Promtail: job `security-gateway`.
- Evidencias: `docs/evidencias-waf.md` (403 por UA malicioso, 429 por rate limit, extractos de logs).
- Consultas Loki: `{job="security-gateway"} |= "blocked_ua=1"`, `{job="security-gateway"} |= "429"` o `|= "limiting requests"`.

## Hardening Base de Datos (evidencias)
- Postgres sin puerto publicado; redes internas.
- pg_hba endurecido, rol APP minimo, logging DB.
- Evidencias: `docs/evidencias-hardening-db.md` (compose sin ports, docker ps, intentos fallidos desde host, conexion interna via db-proxy, logs pg_hba).
- Configuracion: `infrastructure/database/*`, `docker-compose.yml`.
- Logs DB en Loki: job `security-db` (requiere reinicio postgres-master/db-proxy/promtail).

## Hardening Contenedores
- Backends Node: multi-stage `node:18.18.2-alpine`, usuario no root.
- Seguridad en compose: `security_opt: no-new-privileges`, `cap_drop: [ALL]` en backends/monitoring; gateway/frontends corren como root (ver `docs/hardening-contenedores.md`).
- Recursos y logs con rotacion en varios servicios; pendiente cerrar puertos host de servicios si se exige solo HTTPS.

## Gestion de Secretos
- `.env` ignorado; plantilla `.env.example`.
- Script de rotacion: `scripts/security/rotate-secrets.sh`.
- Flujo recomendado: copiar `.env.example` -> `.env`, rellenar credenciales seguras, no commitear; reiniciar `docker compose` tras cambios.

## Logging y Auditoria
- Stack: Loki + Promtail + Grafana (`http://localhost:3010`).
- Etiquetas: `logging_jobname` (gateway, apps, db/proxy).
- Scripts de consulta:
  - Bash: `scripts/security/query-logs.sh '{job="security-gateway"} |= "403"'`
  - PowerShell: `scripts/security/query-logs.ps1 -Query '{job="security-gateway"} |= "403"'`
- Consultas sugeridas en Grafana Explore:
  - Gateway: `{job="security-gateway"} |= "403"`, `|= "429"`, `|= "blocked_ua=1"`
  - DB/Proxy: `{job="security-db"}`
  - Apps (requiere que emitan JSON a stdout): `{job="security-app"}` y filtros por `event`.
- Dashboard/capturas: pendiente generar y guardar.

## Pendientes clave
- Instrumentar apps para loguear autenticacion (exito/fallo), accesos sensibles, cambios de config en JSON stdout (auth-service propuesto en texto).
- Ejecutar y adjuntar reportes de vulnerabilidades (Trivy/gitleaks).
- Capturas de Grafana/Loki con consultas anteriores.
- Cerrar puertos HTTP directos de servicios si se exige “solo HTTPS”.

## Comandos rapidos de evidencia
- WAF 403: `curl.exe -k -I -A "sqlmap" https://localhost:8443/api/auth/`
- WAF 429: `1..200 | % { curl.exe -k -I -A "Mozilla" https://localhost:8443/api/auth/ }`
- Logs gateway: `./scripts/security/query-logs.ps1 -Query '{job="security-gateway"} |= "429"'`
- Logs DB: `./scripts/security/query-logs.ps1 -Query '{job="security-db"}'`
