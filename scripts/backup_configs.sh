#!/bin/bash
DATE=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="/backups/configs_backup_$DATE.tar.gz"
CONFIG_TEMP_DIR="/tmp/configs_to_backup_$DATE"

echo "Starting configuration backup at $DATE..."

# Ensure the temporary directory exists
mkdir -p $CONFIG_TEMP_DIR

# Copy critical configuration files to a temporary directory
cp /etc/nginx/nginx.conf $CONFIG_TEMP_DIR/nginx.conf
cp /etc/prometheus/prometheus.yml $CONFIG_TEMP_DIR/prometheus.yml
# Add other config files as needed, e.g., Loki, Promtail, Grafana configs
# cp /etc/loki/loki-config.yaml $CONFIG_TEMP_DIR/loki-config.yaml
# cp /etc/promtail/promtail-config.yaml $CONFIG_TEMP_DIR/promtail-config.yaml
# cp /etc/grafana/grafana.ini $CONFIG_TEMP_DIR/grafana.ini

# Create a compressed tarball
tar -czf $BACKUP_FILE -C $CONFIG_TEMP_DIR .

if [ $? -eq 0 ]; then
    echo "Configuration backup successful: $BACKUP_FILE"
else
    echo "Configuration backup failed!"
fi

# Clean up the temporary directory
rm -rf $CONFIG_TEMP_DIR
