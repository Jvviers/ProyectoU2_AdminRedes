#!/bin/bash
BACKUP_DIR="/backups"
RETENTION_DAYS=7

echo "Starting backup cleanup in $BACKUP_DIR (retaining last $RETENTION_DAYS days)..."

# Find and delete files older than RETENTION_DAYS
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

if [ $? -eq 0 ]; then
    echo "Backup cleanup successful."
else
    echo "Backup cleanup failed!"
fi
