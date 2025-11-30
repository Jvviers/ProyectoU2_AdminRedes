# Evidencias WAF y Rate Limiting

## Bloqueo por User-Agent malicioso (403)
- Comando: `curl.exe -k -I -A "sqlmap" https://localhost:8443/api/auth/`
- Respuesta:
  HTTP/1.1 403 Forbidden
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer-when-downgrade
  X-XSS-Protection: 1; mode=block
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https: data:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self'; frame-ancestors 'self'; upgrade-insecure-requests;
- Evidencia adicional sugerida: captura de pantalla de la consola mostrando el 403 y consulta en Loki `{job="security-gateway"} |= "blocked_ua=1"` o `docker logs api-gateway --tail 20 | findstr "blocked_ua=1"`.

## Rate limiting (429)
- Ejecucion (UA permitido, endpoint `/`):
  ```
  1..30 | % { curl.exe -k -I -A "Mozilla" https://localhost:8443/ }
  -> todas las respuestas 200 OK
  ```
  Resultado: no se obtuvo 429; la ruta `/` responde 200 y no se saturó el rate limit (limite 10 r/s con burst 20).
- Observacion: el rate limit se aplica en ubicaciones `/api/...`; la raiz `/` no tiene `limit_req`. Para evidenciar 429:
  - Usar un endpoint protegido por limit_req, p.ej. `/api/auth/` con UA permitido:
    `1..50 | % { curl.exe -k -I -A "Mozilla" https://localhost:8443/api/auth/ }`
    (intento actual devolvió 404 en todas: backend responde 404 pero no se alcanzó 429).
  - Capturar respuestas 429 y logs:
    `docker logs api-gateway --tail 50 | findstr " 429 "` o Loki `{job="security-gateway"} |= "429"`.
  - Si no aparece 429, aumentar la rafaga (ej. 1..150) o lanzar dos loops en paralelo para superar 10 r/s con burst 20.
  - Intento actual (UA Mozilla, /api/auth/): devolvio 404 y los logs no muestran 429 (`docker logs api-gateway --tail 50 | findstr " 429 "` sin coincidencias). Pendiente generar 429 con mayor rafaga/paralelismo.
  - Nuevo intento (rafaga mayor sobre /api/auth/):
    - Logs: `docker logs api-gateway --tail 100 | findstr " 429 "` muestran eventos `limiting requests... zone "perip"` en timestamps 20:22:13-20:22:14 (exceso ~20), evidenciando activacion de rate limit (429).
    - Falta capturar la salida de consola con el 429 (comando curl) para completar la evidencia visual.
  - Intento tras agregar `limit_req_status 429` y reiniciar gateway:
    - Logs: `docker logs api-gateway --tail 100 | findstr " 429 "` muestran entradas de `limiting requests, excess ... zone "perip"` (timestamps ~20:24:57-20:25:00), confirmando que el rate limit se dispara.
    - Pendiente: obtener al menos una linea de consola con `HTTP/1.1 429 Too Many Requests` (bucle mas intenso/parallel) para adjuntarla como evidencia visual.
  - Intento final (200 peticiones a /api/auth/ con UA Mozilla):
    - Consola (extracto): mezcla de `404` y `429` recibidos (varias lineas 429 presentes).
    - Logs: `docker logs api-gateway --tail 100 | findstr "limiting requests"` muestra numerosos eventos de limit_req (excess ~20) sobre /api/auth/ alrededor de 20:27:16-20:27:17.
    - Evidencia: con la rafaga de 200 ya se observan 429 en respuesta y en logs.
