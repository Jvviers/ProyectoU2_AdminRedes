FROM alpine:latest

# Install cron and PostgreSQL client
RUN apk add --no-cache dcron postgresql-client gzip tar findutils bash

# Set working directory
WORKDIR /app

# Copy scripts
COPY scripts/backup_db.sh /usr/local/bin/backup_db.sh
COPY scripts/backup_configs.sh /usr/local/bin/backup_configs.sh
COPY scripts/cleanup_backups.sh /usr/local/bin/cleanup_backups.sh

# Give execution rights
RUN chmod +x /usr/local/bin/backup_db.sh \
    /usr/local/bin/backup_configs.sh \
    /usr/local/bin/cleanup_backups.sh

# Create a cron job
# Run backup_db.sh and backup_configs.sh daily at 2 AM, then cleanup
RUN (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup_db.sh && /usr/local/bin/backup_configs.sh && /usr/local/bin/cleanup_backups.sh >> /var/log/cron.log 2>&1") | crontab -
# Ensure cron logs are sent to stdout/stderr for Docker logs
RUN touch /var/log/cron.log

# Run cron in the foreground
CMD ["sh", "-c", "crond -f -L /var/log/cron.log && tail -f /var/log/cron.log"]
