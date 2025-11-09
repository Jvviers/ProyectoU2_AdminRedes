-- =====================================================
-- Script de inicialización de la base de datos
-- PostgreSQL 15
-- =====================================================

-- La base de datos ya se crea desde docker-compose con POSTGRES_DB
-- Solo necesitamos crear las tablas

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    rut VARCHAR(12) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ciudadano', 'funcionario', 'administrador')),
    activo BOOLEAN DEFAULT TRUE,
    verificado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: direcciones_municipales
-- =====================================================
CREATE TABLE IF NOT EXISTS direcciones_municipales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100),
    horario_atencion VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: unidades
-- =====================================================
CREATE TABLE IF NOT EXISTS unidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    direccion_id UUID NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (direccion_id) REFERENCES direcciones_municipales(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: servicios
-- =====================================================
CREATE TABLE IF NOT EXISTS servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tiempo_estimado_minutos INTEGER NOT NULL DEFAULT 15,
    unidad_id UUID NOT NULL,
    requiere_agendamiento BOOLEAN DEFAULT TRUE,
    permite_turno BOOLEAN DEFAULT TRUE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: agendamientos
-- =====================================================
CREATE TABLE IF NOT EXISTS agendamientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    servicio_id UUID NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'confirmado', 'cancelado', 'completado', 'no_asistio')),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('presencial', 'online')),
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: turnos
-- =====================================================
CREATE TABLE IF NOT EXISTS turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_turno VARCHAR(10) NOT NULL,
    servicio_id UUID NOT NULL,
    usuario_id UUID,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('esperando', 'en_atencion', 'completado', 'cancelado')),
    prioridad INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_llamado TIMESTAMP,
    fecha_completado TIMESTAMP,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLA: estaciones
-- =====================================================
CREATE TABLE IF NOT EXISTS estaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL,
    servicio_id UUID NOT NULL,
    funcionario_id UUID,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('disponible', 'ocupada', 'fuera_servicio')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE,
    FOREIGN KEY (funcionario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLA: estadisticas
-- =====================================================
CREATE TABLE IF NOT EXISTS estadisticas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    servicio_id UUID NOT NULL,
    fecha DATE NOT NULL,
    total_atenciones INTEGER DEFAULT 0,
    tiempo_espera_promedio_minutos INTEGER DEFAULT 0,
    tiempo_atencion_promedio_minutos INTEGER DEFAULT 0,
    total_no_asistencias INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE,
    UNIQUE(servicio_id, fecha)
);

-- =====================================================
-- TABLA: notificaciones
-- =====================================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('email', 'sms', 'push')),
    asunto VARCHAR(200),
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'enviado', 'fallido')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_envio TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES para mejorar rendimiento
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rut ON usuarios(rut);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_agendamientos_fecha ON agendamientos(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_agendamientos_estado ON agendamientos(estado);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_estadisticas_fecha ON estadisticas(fecha);

-- =====================================================
-- TRIGGERS para actualizar ultima_actualizacion
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_timestamp_queues()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_timestamp
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_agendamientos_timestamp
    BEFORE UPDATE ON agendamientos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- =====================================================
-- DATOS DE PRUEBA (Opcional - solo para desarrollo)
-- =====================================================

-- Usuario administrador por defecto
-- Password: admin123 (debería cambiarse en producción)
INSERT INTO usuarios (nombre, apellido, email, rut, password_hash, rol, verificado) 
VALUES (
    'Admin',
    'Sistema',
    'admin@lascondes.cl',
    '11111111-1',
    '$2b$10$xQeGOZ3veVnFaoJCHi8pPOY4WETKvTgM8r8yebAtI1IIfIT9cJEIS',
    'administrador',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Dirección municipal de ejemplo
INSERT INTO direcciones_municipales (nombre, direccion, telefono, email, horario_atencion)
VALUES (
    'Dirección de Tránsito',
    'Av. Las Condes 12345',
    '+56912345678',
    'transito@lascondes.cl',
    'Lunes a Viernes 9:00-18:00'
) ON CONFLICT DO NOTHING;

-- Finalizado
--Unidad de ejemplo
         INSERT INTO unidades (nombre, descripcion, direccion_id)
         SELECT 'Licencias de Conducir', 'Unidad para la obtención y renovación de licencias.', id
         FROM direcciones_municipales WHERE nombre = 'Dirección de Tránsito'
         ON CONFLICT DO NOTHING;
    
         -- Servicio de ejemplo
     INSERT INTO servicios (nombre, descripcion, tiempo_estimado_minutos, unidad_id)
        SELECT 'Renovación Licencia Clase B', 'Renovación de licencia de conducir para vehículos particulares.', 30, u.id
        FROM unidades u WHERE u.nombre = 'Licencias de Conducir'
     ON CONFLICT DO NOTHING;



-- =====================================================
-- TABLA: queues (para turnos espontáneos)
-- =====================================================
CREATE TABLE IF NOT EXISTS queues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL,
    number INTEGER NOT NULL,
    client_name VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('waiting', 'called', 'finished', 'cancelled')) DEFAULT 'waiting',
    station VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES servicios(id) ON DELETE CASCADE,
    UNIQUE (service_id, number)
);

-- Trigger para actualizar 'updated_at' en la tabla 'queues'
CREATE TRIGGER trigger_queues_updated_at
    BEFORE UPDATE ON queues
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_queues();


SELECT 'Base de datos inicializada correctamente' AS status;

