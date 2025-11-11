#!/bin/sh
set -e

# Defaults
PGDATA_DIR="${PGDATA:-/var/lib/postgresql/data}"
REPLICATION_USER="${REPLICATION_USER:-repl_user}"
REPLICATION_PASSWORD="${REPLICATION_PASSWORD:-repl_password}"

echo "[pg-hba-fixer] Waiting for postgres-master to be ready..."
i=0
until pg_isready -h postgres-master -p 5432 >/dev/null 2>&1; do
  i=$((i+1))
  if [ "$i" -ge 120 ]; then
    echo "[pg-hba-fixer] postgres-master not ready after 120s" >&2
    exit 1
  fi
  sleep 1
done
echo "[pg-hba-fixer] Master is ready. Patching pg_hba.conf if needed..."

HBA="$PGDATA_DIR/pg_hba.conf"
LINE="host replication ${REPLICATION_USER} 0.0.0.0/0 scram-sha-256"
if ! grep -qF "$LINE" "$HBA" 2>/dev/null; then
  printf "%s\n" "$LINE" | cat - "$HBA" > "$HBA.new" && mv "$HBA.new" "$HBA"
  echo "[pg-hba-fixer] Added replication rule to pg_hba.conf"
else
  echo "[pg-hba-fixer] Replication rule already present"
fi

echo "[pg-hba-fixer] Ensuring replication role exists..."
# Use escaped $$ inside -c to avoid shell PID expansion
psql -h postgres-master -p 5432 -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 \
  -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${REPLICATION_USER}') THEN CREATE ROLE ${REPLICATION_USER} WITH LOGIN REPLICATION PASSWORD '${REPLICATION_PASSWORD}'; END IF; END $$;"
psql -h postgres-master -p 5432 -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "SELECT pg_reload_conf();"

echo "[pg-hba-fixer] Done."
