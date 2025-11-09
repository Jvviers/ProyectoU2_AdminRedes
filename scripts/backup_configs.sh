#!/bin/bash
DATE=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/backups/configs_backup_$DATE"

echo "Starting configuration backup at $DATE..."

# Ensure the backup directory exists
mkdir -p $BACKUP_DIR

# Copy critical configuration files
cp /etc/nginx/nginx.conf $BACKUP_DIR/nginx.conf
cp /etc/prometheus/prometheus.yml $BACKUP_DIR/prometheus.yml
# Assuming .env is at the project root
# cp /app/.env $BACKUP_DIR/.env

if [ $? -eq 0 ]; then
    echo "Configuration backup successful: $BACKUP_DIR"
else
    echo "Configuration backup failed!"
fi