#!/bin/bash
BACKUP_FILE=$1
DB_NAME="${DB_NAME}"
DB_USER="${DB_USER}"
DB_PASSWORD="${DB_PASSWORD}"
DB_HOST="postgres-master" # Or the current master's host

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <path_to_backup_file.sql.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found."
    exit 1
fi

echo "Starting PostgreSQL restore from $BACKUP_FILE..."

# Drop existing database and create a new one (be careful with this in production!)
# This assumes you want to completely overwrite the database.
# For a more granular restore, you might need to connect to the DB and run specific commands.
PGPASSWORD=$DB_PASSWORD dropdb -h $DB_HOST -U $DB_USER $DB_NAME
PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -U $DB_USER $DB_NAME

# Restore the database from the compressed backup
gunzip -c $BACKUP_FILE | PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME

if [ $? -eq 0 ]; then
    echo "PostgreSQL restore successful."
else
    echo "PostgreSQL restore failed!"
fi
