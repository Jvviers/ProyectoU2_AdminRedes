# Checklist: Proyecto 3 - Hardening y Seguridad (2025-II)

---

## 1. HTTPS/TLS (Comunicación Segura) 
**Requisito:** Todos los servicios expuestos DEBEN usar HTTPS.
- [x] **Configuración General:**
    - [x] Asegurar que el Frontend sea accesible únicamente por HTTPS
    - [x] Configurar certificado TLS en el API Gateway
    - [x] Implementar redirección automática HTTP → HTTPS
    - [x] Configurar Headers de seguridad (HSTS, X-Frame-Options, CSP, etc.)
- [ ] **Implementación (Elegir una):**
    - [ ] Opción A: Traefik con gestión automática (Recomendado)
    - [x] Opción B: Certificados autofirmados con OpenSSL
    - [ ] Opción C: Let's Encrypt con Certbot
- [ ] **Entregables:**
    - [x] Script de generación de certificados en `scripts/security/`
    - [x] Captura de pantalla del navegador mostrando el candado/HTTPS activo
    - [x] Documentación del proceso en el `README`

## 2. Hardening de Contenedores Docker 
**Requisito:** Aplicar mejores prácticas de seguridad en imágenes y ejecución.
- [ ] **Dockerfiles:**
    - [x] Configurar usuario no privilegiado (no usar root)
    - [x] Usar versiones específicas en imágenes base (NO usar tag `:latest`)
    - [x] Implementar Multi-stage builds (separar construcción de ejecución)
- [ ] **Docker Compose:**
    - [x] Configurar `security_opt: no-new-privileges`
    - [x] Eliminar capabilities innecesarias (`cap_drop`)
    - [x] Definir límites de recursos (CPU y Memoria)
    - [x] Configurar políticas de reinicio (`restart policies`)
    - [x] Configurar rotación de logs
- [ ] **Entregables:**
    - [ ] Reporte de escaneo de vulnerabilidades (Trivy, Docker Scout, etc.)
    - [x] Documento explicativo: `docs/hardening-contenedores.md`

## 3. Hardening de Bases de Datos 
**Requisito:** Asegurar el motor de BD según mejores prácticas.
- [x] **Autenticación y Usuarios:**
    - [x] Deshabilitar acceso sin contraseña y acceso remoto de root
    - [x] Configurar contraseñas fuertes (mínimo 12 caracteres)
    - [x] Crear usuario específico para la aplicación con privilegios mínimos (SELECT, INSERT, UPDATE, DELETE)
    - [x] Revocar permisos administrativos al usuario de la aplicación (DROP, GRANT, etc.)
- [ ] **Red y Configuración:**
    - [x] Aislar la BD en una red interna de Docker
    - [x] **NO** exponer puertos de la BD al host (solo acceso interno)
    - [x] Habilitar logs de conexiones, desconexiones e intentos fallidos
- [ ] **Entregables:**
    - [x] Archivos de configuración en `infrastructure/database/`
    - [x] Scripts de inicialización de usuarios y permisos (hardening.sh)
    - [x] Documento explicativo: `docs/hardening-database.md`
    - [x] Evidencia (captura/log) de que la BD no es accesible desde el host.

## 4. Gestión de Secretos 
**Requisito:** Cero credenciales en texto plano en el código o repositorio.
- [ ] **Implementación:**
    - [ ] Usar Docker Secrets (Recomendado) o variables de entorno seguras.
    - [x] Asegurar que el archivo `.env` esté en `.gitignore`.
    - [x] Crear archivo plantilla `.env.example`.
- [ ] **Operación:**
    - [ ] Implementar mecanismo de rotación de secretos.
    - [ ] Verificar que no existan secretos en el historial de Git.
- [ ] **Entregables:**
    - [ ] Script de rotación en `scripts/security/rotate-secrets.sh`.
    - [x] Documentación de uso en el `README`.

## 5. WAF / Rate Limiting 
**Requisito:** Protección básica contra ataques web.
- [ ] **Configuración (Traefik, Nginx o ModSecurity):**
    - [x] Implementar Rate Limiting (límite de peticiones por IP).
    - [x] Bloquear User-Agents maliciosos conocidos.
    - [x] Configurar headers de seguridad HTTP.
    - [x] Habilitar logs de peticiones bloqueadas.
- [ ] **Entregables:**
    - [x] Logs que demuestren bloqueos efectivos.
    - [x] Capturas de pantalla de pruebas de bloqueo.

## 6. Logging y Auditoría de Seguridad
**Requisito:** Sistema centralizado enfocado en seguridad.
- [ ] **Configuración:**
    - [x] Implementar sistema (Loki+Grafana recomendado o Docker logs básico) 
    - [/] Registrar eventos obligatorios: Autenticación (éxito/fallo), Accesos denegados (401/403), Acceso a endpoints sensibles, Cambios de config, Conexiones a BD 
- [ ] **Entregables:**
    - [x] Configuración de logs en `docker-compose.yml`.
    - [-] Script para consultar logs de seguridad.
    - [x] Dashboard o capturas mostrando los logs funcionando.



