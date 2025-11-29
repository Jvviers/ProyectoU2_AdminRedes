#!/bin/sh
set -euo pipefail

LOKI_URL=${LOKI_URL:-http://localhost:3100}
QUERY=${1:-"{job=\"security-gateway\"} |= \"403\""}
LIMIT=${LIMIT:-100}

curl -sG "$LOKI_URL/loki/api/v1/query" \
  --data-urlencode "query=$QUERY" \
  --data-urlencode "limit=$LIMIT" \
  --data-urlencode "time=$(($(date +%s%N)))" | jq '.data.result'
