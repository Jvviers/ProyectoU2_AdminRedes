#!/bin/sh
set -e

# If the data directory is not empty and it's already a replica, just start postgres
if [ -n "$(ls -A /var/lib/postgresql/data)" ] && [ -f "/var/lib/postgresql/data/standby.signal" ]; then
    exec docker-entrypoint.sh postgres
fi

echo "Waiting for master to be available..."
until pg_isready -h postgres-master -p 5432 -q
do
    sleep 1
done
echo "Master is available."

echo "Cleaning data directory for base backup..."
rm -rf /var/lib/postgresql/data/*

echo "Performing base backup from master..."
PGPASSWORD=${REPLICATION_PASSWORD:-repl_password} pg_basebackup \
    -h postgres-master \
    -p 5432 \
    -U ${REPLICATION_USER:-repl_user} \
    -D /var/lib/postgresql/data \
    -Fp -Xs -R

echo "Base backup complete. Starting replica..."
exec docker-entrypoint.sh postgres
