# Informe de Cumplimiento - Seguridad y Operacion

## 1. HTTPS/TLS
- Certificados dev: `scripts/security/generate-dev-cert.sh` (autofirmado dev.local/127.0.0.1).
- Redireccion HTTP->HTTPS: definida en `services/api-gateway/nginx.conf`.
- Headers de seguridad: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection, CSP en `services/api-gateway/nginx.conf`.
- Documentacion: ver README (seccion Infraestructura/HTTPS) y `docs/hardening-contenedores.md`.
- [ESPACIO PARA PANTALLAZOS/PRUEBAS] curl -I http://localhost:8080 -> Location: https://...

## 2. Hardening de Contenedores
- Usuarios no privilegiados: servicios Node y DB-proxy/Grafana/Loki/etc. usan usuarios no root; excepcion: gateway/frontends corren como root para evitar chown en /var/cache/nginx (justificado en `docs/hardening-contenedores.md`).
- Configuraciones de seguridad: `security_opt: no-new-privileges` y `cap_drop: [ALL]` aplicadas a backends, gateway (quitado temporalmente en nginx), monitoreo; rate limiting en gateway.
- Multi-stage builds: servicios Node usan multi-stage con `node:18.18.2-alpine`.
- Escaneo de vulnerabilidades: [PENDIENTE] agregar reporte (gitleaks/trivy/grype). Espacio reservado.
- Documentacion: `docs/hardening-contenedores.md`.

## 3. Hardening de Bases de Datos
- Autenticacion/privilegios minimos: rol APP con minimos en `infrastructure/database/02-hardening.sh`; usuario de replicacion configurado.
- Aislamiento de red: redes separadas (frontend/backend/database) en `docker-compose.yml`; Postgres no expone al host.
- Logging/auditoria: pendiente integracion de logs DB en Loki; proxy HAProxy con healthchecks. [PENDIENTE] anadir query/logs especificos DB.
- Evidencias de no exposicion y alcance interno: ver `docs/evidencias-hardening-db.md` (sin puertos publicados, intentos fallidos desde host, conexion interna exitosa, logs pg_hba).
- Documentacion: `docs/hardening-database.md`.

## 4. Gestion de Secretos
- Sistema: variables via `.env`, `.env.example` con placeholders fuertes; compose sin credenciales hardcodeadas.
- Script de rotacion: `scripts/security/rotate-secrets.sh` (genera DB/APP DB/Redis/JWT/SMTP/API keys/Grafana/replicacion).
- Sin credenciales en Git: `.env` ignorado; verificar historial con gitleaks/trufflehog (pendiente ejecutar reporte).
- Documentacion operativa de entorno:
  - `.env` en la raiz con todas las variables de entorno (DB, APP_DB, Redis, JWT, SMTP, API keys, Grafana, replicacion, puertos, origenes).
  - Flujo recomendado: `cp .env.example .env` (o copia manual), rellenar con credenciales seguras, no commitear `.env`.
  - Tras cambiar secretos: `docker compose down && docker compose up -d` para propagar valores.
  - Referencia ampliada en README (seccion Gestion de secretos).
- Documentacion: README (Gestion de secretos).

## 5. WAF y Seguridad de Red
- WAF/Rate limiting: en `services/api-gateway/nginx.conf` (`limit_req`, bloqueo de UAs comunes, metodos permitidos, headers). Logs JSON no; se usa formato access log.
- Segmentacion de redes: `frontend-network`, `backend-network`, `database-network` en compose.
- Pruebas de bloqueo: [PENDIENTE] incluir salidas/ capturas de curl 403 (UA) y 429 (rate limit) + extractos de logs.

## 6. Analisis de Vulnerabilidades
- Reportes: [PENDIENTE] adjuntar resultados de gitleaks/trivy/grype.
- Documento de remediacion: [PENDIENTE] listar hallazgos y acciones.
- Script automatizado: [PENDIENTE] anadir script (ej. `scripts/security/scan.sh`).

## 7. Logging y Auditoria
- Sistema: Loki + Promtail + Grafana; `promtail-config.yml` etiqueta contenedores y filtra eventos de seguridad (401/403 en gateway, JSON app).
- Eventos registrados: 401/403 gateway; cualquier evento app logueado en JSON con status/path/user. [PENDIENTE] capturas de dashboard/queries en Grafana.
- Script de consulta: `scripts/security/query-logs.sh`.
- Documentacion: `docs/logging-seguridad.md`.

## 8. Documentacion y Politicas
- Documentos: README actualizado; `docs/hardening-contenedores.md`, `docs/hardening-database.md`, `docs/logging-seguridad.md`, `docs/evidencias-hardening-db.md`.
- Politicas/pasos operativos: README (arranque, secretos, logging). [PENDIENTE] anadir politicas formales si las requiere la rubrica.

## Notas operativas
- Gateway/frontends corren como root por limitacion de la imagen nginx (chown en `/var/cache/nginx`). Opciones de endurecimiento en `docs/hardening-contenedores.md`.
- Pruebas y capturas: marcar como pendiente; colocar evidencias en cada seccion cuando se ejecuten.
