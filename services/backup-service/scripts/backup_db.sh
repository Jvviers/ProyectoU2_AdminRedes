#!/bin/bash
DATE=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="/backups/db_backup_$DATE.sql.gz"
DB_NAME="${DB_NAME}" # These should be passed as environment variables or read from .env
DB_USER="${DB_USER}"
DB_PASSWORD="${DB_PASSWORD}"
DB_HOST="db-proxy" # Always backup from the current master

echo "Starting PostgreSQL backup at $DATE..."

# Ensure the backup directory exists
mkdir -p /backups

# Perform the backup with compression
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "PostgreSQL backup successful: $BACKUP_FILE"
else
    echo "PostgreSQL backup failed!"
fi