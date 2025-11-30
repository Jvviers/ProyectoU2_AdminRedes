#!/bin/sh
# Regenera secretos para .env (no escribe automáticamente).
# Uso: ./scripts/security/rotate-secrets.sh > new-secrets.env && luego mergear manualmente en .env
set -euo pipefail

rand_hex() {
  openssl rand -hex "$1"
}

echo "# Nuevos secretos generados el $(date -Iseconds)"
echo "DB_PASSWORD=$(rand_hex 16)"
echo "APP_DB_PASSWORD=$(rand_hex 16)"
echo "REPLICATION_PASSWORD=$(rand_hex 16)"
echo "REDIS_PASSWORD=$(rand_hex 12)"
echo "JWT_SECRET=$(rand_hex 32)"
echo "SMTP_PASSWORD=$(rand_hex 16)"
echo "OPENAI_API_KEY=$(printf 'sk-%s' \"$(rand_hex 24)\")"
echo "GEMINI_API_KEY=$(rand_hex 24)"
echo "GRAFANA_PASSWORD=$(rand_hex 12)"
echo "# Recuerda actualizar variables dependientes en servicios y reiniciar contenedores."
