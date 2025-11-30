#!/bin/sh
set -euo pipefail

# Genera un certificado autofirmado para dev.local y 127.0.0.1
# Uso: ./generate-dev-cert.sh [ruta_destino]

DEST_DIR="${1:-./services/api-gateway/certs}"
mkdir -p "$DEST_DIR"

CERT="$DEST_DIR/cert.pem"
KEY="$DEST_DIR/key.pem"

openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
  -keyout "$KEY" -out "$CERT" \
  -subj "/C=CL/ST=RM/L=Santiago/O=Dev/OU=IT/CN=dev.local" \
  -addext "subjectAltName=DNS:dev.local,IP:127.0.0.1"

echo "Certificado generado en: $CERT"
echo "Llave generada en:       $KEY"
