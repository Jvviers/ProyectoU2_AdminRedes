#!/usr/bin/env bash
  set -euo pipefail
  CERT_DIR="services/api-gateway/certs"
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout "$CERT_DIR/key.pem" -out "$CERT_DIR/cert.pem" \
    -subj "/CN=dev.local" \
    -addext "subjectAltName=DNS:dev.local,DNS:localhost,IP:127.0.0.1"
  cp "$CERT_DIR/cert.pem" "$CERT_DIR/dev.local.crt"
  echo "Certs listos en $CERT_DIR"