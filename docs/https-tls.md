# Proceso HTTPS/TLS (comunicacion segura)

## 1. Generar certificados (desarrollo)
- Script: `scripts/security/generate-dev-cert.sh` (Windows: `sh scripts/security/generate-dev-cert.sh`).
- Generar `cert.pem` y `key.pem` en `services/api-gateway/certs/` con SAN para `dev.local` y `127.0.0.1`.
- Si usas otro dominio/IP, ajusta el CN/SAN en el script y la ruta destino (`./scripts/security/generate-dev-cert.sh ./otra/ruta`).

## 2. Configuracion del API Gateway (Nginx)
Archivo: `services/api-gateway/nginx.conf`.
- Puerto 80: solo redireccion 301 a HTTPS.
- Puerto 443: usa `ssl_certificate`/`ssl_certificate_key` -> `cert.pem`/`key.pem`; protocolos TLSv1.2/1.3; cifrados fuertes.
- Cabeceras de seguridad: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection, CSP con `upgrade-insecure-requests`.
- Metodos permitidos: GET/POST/PUT/DELETE/HEAD/OPTIONS (resto -> 405).
- WAF basico: rate limit 10 r/s burst 20 y bloqueo de User-Agents comunes.

## 3. docker-compose (exposicion)
Archivo: `docker-compose.yml`.
- Gateway expone `8080:80` (solo para redireccion) y `8443:443` (HTTPS).
- Acceso recomendado: `https://localhost:8443` o `https://dev.local:8443` (anade `127.0.0.1 dev.local` a `/etc/hosts` o `C:\Windows\System32\drivers\etc\hosts`).

## 4. Levantar la pila
```
docker compose down
docker compose up -d --build
```

## 5. Verificacion
- Navegador: abre `https://localhost:8443` (acepta riesgo por autofirmado) y confirma candado/HTTPS.
- Redireccion: `curl -k -I http://localhost:8080` debe devolver 301 a https.
- Cabeceras: `curl -k -I https://localhost:8443 | findstr /R "Strict-Transport-Security\|Content-Security-Policy\|X-Frame-Options\|X-Content-Type-Options"`.
- Cert/protocolo: `openssl s_client -connect localhost:8443 -servername dev.local -showcerts` para revisar CN/SAN y TLS.

## 6. Notas y pendientes
- Para cumplir "solo HTTPS", evita exponer puertos HTTP de backend al host (3000/3001/3004/3005/3006/3007/3011-3014) y accede solo via gateway.
- Produccion: usar CA confiable (Traefik/Certbot/Let's Encrypt) en lugar de autofirmado.
- Anadir captura de navegador con candado en `docs/` como evidencia.
- Si cambias dominio/IP, regenera certificado y actualiza `server_name` en `nginx.conf`.
