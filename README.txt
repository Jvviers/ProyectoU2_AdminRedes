README - Instrucciones de Inicio del Proyecto

1) Requisitos
- Docker y Docker Compose instalados.

2) Arranque
- Desde la raiz: 
  docker compose down
  docker compose up -d --build
- Verificacion: docker compose ps
- Accesos: API Gateway https://localhost:8443, Prometheus http://localhost:9090, Grafana http://localhost:3010, frontends via gateway (/auth, /config, /admin, /totem, /).

3) Infraestructura
- PostgreSQL solo interno (5432); acceso externo via db-proxy (HAProxy).
- API Gateway fuerza HTTPS; certificados dev con scripts/security/generate-dev-cert.sh.

Gestion de secretos
- .env esta en .gitignore. Crea tu .env copiando .env.example y reemplazando TODOS los placeholders (CHANGE_ME_*), incluyendo REPLICATION_USER/REPLICATION_PASSWORD.
- Rotacion: ./scripts/security/rotate-secrets.sh > new-secrets.env; copia valores a .env (o gestor de secretos) y reinicia: docker compose down && docker compose up -d.
- No hay credenciales hardcodeadas en docker-compose.yml; todo proviene de variables de entorno.

Logging de seguridad (Loki + Promtail + Grafana)
- Etiquetas: gateway y servicios app llevan labels logging_jobname (security-gateway / security-app) en docker-compose.yml.
- Promtail: parsea access logs de gateway y conserva 401/403; parsea JSON de apps (labels level/status/path/user si la app loguea en JSON).
- Consulta: scripts/security/query-logs.sh '{job="security-gateway"} |= "403"' (usa LOKI_URL=http://localhost:3100 por defecto, LIMIT ajustable).
- Documentacion: docs/logging-seguridad.md (queries, eventos cubiertos, notas de seguridad).

Auditoria de historial
- Ejecuta un escaner (gitleaks/trufflehog) sobre git rev-list --all. Si aparece algo, rota en el proveedor y actualiza tus secretos locales.

Nota nginx (frontends/gateway)
- Se ejecutan como root para evitar el fallo de chown en /var/cache/nginx de la imagen nginx:alpine. Para endurecer, usar tmpfs o imagen derivada con permisos precreados antes de volver a no-root.
