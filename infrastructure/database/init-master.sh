#!/bin/sh
set -e

# Create the replication user if not exists (login + replication)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${REPLICATION_USER:-repl_user}') THEN
      CREATE ROLE ${REPLICATION_USER:-repl_user} WITH LOGIN REPLICATION PASSWORD '${REPLICATION_PASSWORD:-repl_password}';
   END IF;
END$$;
EOSQL

# Add replication entry to pg_hba.conf to allow the replica to connect
# Prepend to ensure it's processed first. Use a permissive CIDR suitable for containers.
# You may narrow this to your docker network (e.g., 172.20.0.0/16) if desired.
echo "host replication ${REPLICATION_USER:-repl_user} 0.0.0.0/0 scram-sha-256" | cat - "$PGDATA/pg_hba.conf" > "$PGDATA/pg_hba.conf.new" && mv "$PGDATA/pg_hba.conf.new" "$PGDATA/pg_hba.conf"

# Reload the configuration
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "SELECT pg_reload_conf();"
