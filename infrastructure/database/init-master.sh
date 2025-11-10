#!/bin/bash
set -e

# Create the replication user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER ${REPLICATION_USER:-repl_user} WITH REPLICATION ENCRYPTED PASSWORD '${REPLICATION_PASSWORD:-repl_password}';
EOSQL

# Add replication entry to pg_hba.conf to allow the replica to connect
echo "host replication all 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"

# Reload the configuration
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "SELECT pg_reload_conf();"
