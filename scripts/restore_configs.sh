#!/bin/bash
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <path_to_backup_file.tar.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found."
    exit 1
fi

echo "Starting configuration restore from $BACKUP_FILE..."

# Extract the compressed tarball to a temporary directory
RESTORE_TEMP_DIR="/tmp/configs_restore_$(date +%Y%m%d%H%M%S)"
mkdir -p $RESTORE_TEMP_DIR
tar -xzf $BACKUP_FILE -C $RESTORE_TEMP_DIR

if [ $? -ne 0 ]; then
    echo "Error: Failed to extract backup file."
    rm -rf $RESTORE_TEMP_DIR
    exit 1
fi

echo "Restoring Nginx configuration..."
cp $RESTORE_TEMP_DIR/nginx.conf /etc/nginx/nginx.conf

echo "Restoring Prometheus configuration..."
cp $RESTORE_TEMP_DIR/prometheus.yml /etc/prometheus/prometheus.yml

# Add restore for other config files as needed, e.g., Loki, Promtail, Grafana configs
# cp $RESTORE_TEMP_DIR/loki-config.yaml /etc/loki/loki-config.yaml
# cp $RESTORE_TEMP_DIR/promtail-config.yaml /etc/promtail/promtail-config.yaml
# cp $RESTORE_TEMP_DIR/grafana.ini /etc/grafana/grafana.ini

if [ $? -eq 0 ]; then
    echo "Configuration restore successful."
else
    echo "Configuration restore failed!"
fi

# Clean up the temporary directory
rm -rf $RESTORE_TEMP_DIR
