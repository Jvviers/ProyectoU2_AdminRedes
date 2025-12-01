### LISTADO DE TAREAS Y REQUISITOS - PROYECTO 3 (HARDENING)

#### 1. REQUISITOS GENERALES
- [ ] Prerrequisito: Tener completado el Proyecto 2 (misma arquitectura base)[cite: 13].
- [ ] Objetivo: Implementar capa de seguridad, HTTPS, hardening, gestión de secretos y logging[cite: 9, 10].

#### 2.1. HTTPS/TLS (COMUNICACIÓN SEGURA)
**Requisitos:**
- [ ] El Frontend debe ser accesible únicamente por HTTPS[cite: 30, 31].
- [ ] API Gateway debe tener certificado TLS configurado[cite: 32].
- [ ] Configurar redirección automática HTTP → HTTPS[cite: 33].
- [ ] Implementar Headers de seguridad HTTP (HSTS, X-Frame-Options, CSP, etc.)[cite: 34].
- [ ] Opción recomendada: Traefik con gestión automática; Opción válida: Certificados autofirmados[cite: 36, 37].

**Entregables:**
- [ ] Certificados TLS configurados y funcionando[cite: 40].
- [ ] Configuración del servidor web con HTTPS[cite: 41].
- [ ] Script de generación de certificados en: `scripts/security/`[cite: 42].
- [ ] Captura de pantalla del navegador mostrando el candado HTTPS activo[cite: 43].
- [ ] Documentación del proceso en el `README`[cite: 44].

#### 2.2. HARDENING DE CONTENEDORES DOCKER
**Requisitos (Dockerfiles):**
- [ ] Usuario no privilegiado: Ejecutar con usuario distinto a root[cite: 51].
- [ ] Imágenes base: Usar versiones específicas (Prohibido usar tag `:latest`)[cite: 52].
- [ ] Usar Multi-stage builds (separar construcción de ejecución)[cite: 53].
- [ ] Escaneo de vulnerabilidades en todas las imágenes[cite: 54].

**Requisitos (Docker Compose):**
- [ ] `security_opt`: Configurar `no-new-privileges`[cite: 56].
- [ ] `cap_drop`: Eliminar capabilities innecesarias[cite: 57].
- [ ] Límites de recursos: Configurar memoria y CPU[cite: 58].
- [ ] Políticas de restart apropiadas[cite: 59].
- [ ] Configuración de logging con rotación[cite: 60].

**Entregables:**
- [ ] Dockerfiles actualizados con medidas de hardening[cite: 62].
- [ ] Reporte de escaneo de vulnerabilidades (Trivy, Docker Scout, etc.)[cite: 63].
- [ ] `docker-compose.yml` con configuraciones de seguridad[cite: 64].
- [ ] Documento explicativo en: `docs/hardening-contenedores.md`[cite: 65].

#### 2.3. HARDENING DE BASES DE DATOS
**Requisitos:**
- [ ] Autenticación obligatoria (sin acceso sin contraseña, contraseñas >12 caracteres) [cite: 73-75].
- [ ] Usuario de aplicación con privilegios mínimos (NO usar root/admin, solo SELECT, INSERT, UPDATE, DELETE) [cite: 77-80].
- [ ] Gestión segura de credenciales (Docker Secrets o variables de entorno, NADA hardcodeado)[cite: 83, 84].
- [ ] Aislamiento de red: BD en red interna, sin exponer puertos al host[cite: 86, 87].
- [ ] Logging y auditoría: Registrar conexiones, desconexiones e intentos fallidos[cite: 90, 91].

**Entregables:**
- [ ] Archivos de configuración en: `infrastructure/database/`[cite: 97].
- [ ] Scripts de inicialización con usuarios y permisos limitados[cite: 98].
- [ ] Documento explicativo en: `docs/hardening-database.md` (medidas, usuarios, logging) [cite: 99-102].
- [ ] Evidencia de que la BD no es accesible directamente desde el host[cite: 104].

#### 2.4. GESTIÓN DE SECRETOS
**Requisitos:**
- [ ] Implementar Docker Secrets (recomendado) o archivo `.env`[cite: 111, 112].
- [ ] Archivo `.env` debe estar en `.gitignore`[cite: 114].
- [ ] Proporcionar archivo plantilla `.env.example`[cite: 115].
- [ ] Implementar rotación de secretos[cite: 116].

**Entregables:**
- [ ] Sistema de gestión funcionando[cite: 119].
- [ ] Archivo `.env.example` en el repositorio[cite: 120].
- [ ] Script de rotación en: `scripts/security/rotate-secrets.sh`[cite: 121].
- [ ] Verificación de ausencia de secretos reales en el repositorio[cite: 122].
- [ ] Documentación de uso en el `README`[cite: 123].

#### 2.5. WAF / RATE LIMITING
**Requisitos:**
- [ ] Implementar protección (Traefik middlewares, Nginx o ModSecurity) [cite: 126-129].
- [ ] Rate limiting (límite de peticiones por IP)[cite: 131].
- [ ] Bloqueo de user-agents maliciosos[cite: 132].
- [ ] Headers de seguridad HTTP y Logs de bloqueos[cite: 133, 134].

**Entregables:**
- [ ] Configuración de WAF/Rate limiting funcionando[cite: 136].
- [ ] Logs mostrando bloqueos efectivos[cite: 138].
- [ ] Capturas de pantalla de pruebas de bloqueo[cite: 139].

#### 2.6. ANÁLISIS DE VULNERABILIDADES
**Requisitos de Escaneo:**
- [ ] Imágenes Docker (Trivy/Docker Scout): Reportar HIGH y CRITICAL [cite: 146-149].
- [ ] Dependencias (npm audit/pip safety) [cite: 150-152].
- [ ] Puertos (Nmap): Verificar solo puertos necesarios [cite: 154-156].
- [ ] Web básico (Nikto): Verificar headers [cite: 157-159].

**Entregables:**
- [ ] Carpeta con reportes en: `docs/reportes/`[cite: 161].
- [ ] Documento de remediación: `vulnerabilidades-remediadas.md` (hallazgos, correcciones, justificaciones) [cite: 162-165].
- [ ] Script automatizado en: `scripts/security/scan-vulnerabilities.sh`[cite: 166].

#### 2.7. LOGGING Y AUDITORÍA
**Requisitos:**
- [ ] Sistema centralizado (Docker logs básico, Loki+Grafana o ELK) [cite: 172-175].
- [ ] Eventos obligatorios a registrar: Autenticación (éxito/fallo), Accesos denegados (401/403), Acceso a endpoints sensibles, Cambios de config, Conexiones a BD [cite: 176-182].

**Entregables:**
- [ ] Configuración de logs en `docker-compose.yml`[cite: 185].
- [ ] Script para consultar logs de seguridad[cite: 186].
- [ ] Dashboard o capturas mostrando el sistema funcionando[cite: 187].
- [ ] Documentación de eventos registrados[cite: 188].

#### 2.8. POLÍTICAS Y DOCUMENTACIÓN (Carpeta docs/)
Se deben crear 5 documentos Markdown obligatorios (mínimo 1-2 páginas c/u):

1.  `docs/politica-seguridad.md`**: Objetivos, responsabilidades, contraseñas, actualizaciones, accesos, logs .
2.  `docs/matriz-riesgos.md`**: 8-10 riesgos principales, probabilidad/impacto, mitigaciones .
3.  `docs/owasp-top10.md`**: Checklist de los 10 riesgos de OWASP 2021 (si aplica y cómo se mitiga) [cite: 206-209].
4.  `docs/plan-incidentes.md`**: Detección, contención, análisis, recuperación, lecciones aprendidas .
5.  `docs/cumplimiento-normativo.md`**: Ley 19.628, Ley 21.459 y Normas Gobierno Digital.

#### 3. DEFENSA DEL PROYECTO (15 min)
Preparar demostración de los siguientes puntos [cite: 233-243]:
1.  Introducción (1 min).
2.  Demostración HTTPS (3 min): Certificado válido y headers.
3.  Hardening Contenedores (3 min): Usuario no-root y escaneo.
4.  Hardening BD (2 min): Privilegios mínimos y no acceso directo.
5.  Prueba de Seguridad (3 min): Rate limiting/WAF y secretos no en git.
6.  Documentación (2 min): Mostrar estructura `docs/`.