#!/bin/sh
set -euo pipefail

# Ensure required env vars are present
if [ -z "${APP_DB_USER:-}" ]; then
  echo "[hardening] APP_DB_USER no está definida."
  exit 1
fi
if [ -z "${APP_DB_PASSWORD:-}" ]; then
  echo "[hardening] APP_DB_PASSWORD no está definida."
  exit 1
fi
if [ ${#APP_DB_PASSWORD} -lt 12 ]; then
  echo "[hardening] APP_DB_PASSWORD debe tener al menos 12 caracteres."
  exit 1
fi

export PGPASSWORD="${POSTGRES_PASSWORD}"

echo "[hardening] Creando/ajustando rol de aplicación con mínimos privilegios..."
psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" <<SQL
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${APP_DB_USER}') THEN
        EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION', '${APP_DB_USER}', '${APP_DB_PASSWORD}');
    ELSE
        EXECUTE format('ALTER ROLE %I WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION', '${APP_DB_USER}', '${APP_DB_PASSWORD}');
    END IF;
END\$\$;

-- Revocar privilegios de creación/temporal
REVOKE CREATE, TEMP ON DATABASE ${POSTGRES_DB} FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Dar solo uso de schema y CRUD al rol de app
DO \$\$
DECLARE
    app_role text := '${APP_DB_USER}';
BEGIN
    EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', app_role);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I', app_role);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', app_role);
END\$\$;

-- Evitar creación de objetos por defecto por PUBLIC
ALTER DEFAULT PRIVILEGES REVOKE CREATE ON SCHEMAS FROM PUBLIC;
SQL

echo "[hardening] Rol de aplicación configurado."
