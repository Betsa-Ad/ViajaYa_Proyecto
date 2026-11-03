
-- Script DDL Oficial - Sistema ViajaYa (PostgreSQL / Supabase)
-- Define las 5 tablas del Modelo Entidad-Relación (DER)


-- Limpieza en orden inverso de dependencias (para re-ejecución limpia)
DROP TABLE IF EXISTS pago CASCADE;
DROP TABLE IF EXISTS reserva CASCADE;
DROP TABLE IF EXISTS destino CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS administrador CASCADE;

-- 1. TABLA: administrador
-- Almacena las cuentas del personal administrativo y gestores
-- para la autenticación JWT y control de acceso (CAR-05, CAR-06).
CREATE TABLE administrador (
    id_administrador   SERIAL PRIMARY KEY,
    nombre             VARCHAR(100) NOT NULL,
    apellido1          VARCHAR(100) NOT NULL,
    apellido2          VARCHAR(100),
    correo             VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash    VARCHAR(255) NOT NULL,
    estado             VARCHAR(20)  DEFAULT 'ACTIVO'
);

-- 2. TABLA: cliente
-- Contiene el registro de clientes que realizan reservas en la plataforma.
-- El correo es único para permitir la identificación del cliente.
CREATE TABLE cliente (
    id_cliente         SERIAL PRIMARY KEY,
    nombre             VARCHAR(100) NOT NULL,
    apellido1          VARCHAR(100) NOT NULL,
    apellido2          VARCHAR(100),
    correo             VARCHAR(150) NOT NULL UNIQUE,
    telefono           VARCHAR(30)
);

-- 3. TABLA: destino
-- Catálogo de destinos turísticos con su tarifa base por persona,
-- capacidad máxima diaria de cupos y estado lógico (RN-01, CAR-05).

CREATE TABLE destino (
    id_destino         SERIAL PRIMARY KEY,
    nombre             VARCHAR(150) NOT NULL,
    descripcion        TEXT,
    precio_base_persona NUMERIC(10, 2) NOT NULL,
    capacidad_maxima   INTEGER NOT NULL,
    estado             VARCHAR(20) DEFAULT 'ACTIVO'
);


-- 4. TABLA: reserva
-- Registro central de cada reserva turística vinculada a un cliente
-- y un destino. Aplica RN-01 (cupos), RN-02 (48h) y RN-03 (cálculo IVA 13%).

CREATE TABLE reserva (
    id_reserva         SERIAL PRIMARY KEY,
    id_cliente         INTEGER NOT NULL REFERENCES cliente(id_cliente) ON DELETE RESTRICT,
    id_destino         INTEGER NOT NULL REFERENCES destino(id_destino) ON DELETE RESTRICT,
    codigo_confirmacion VARCHAR(50) NOT NULL UNIQUE,
    fecha_viaje        DATE NOT NULL,
    cantidad_personas  INTEGER NOT NULL,
    subtotal           NUMERIC(10, 2) NOT NULL,
    iva                NUMERIC(10, 2) NOT NULL,
    total              NUMERIC(10, 2) NOT NULL,
    estado             VARCHAR(30) DEFAULT 'CONFIRMADA'
);


-- 5. TABLA: pago
-- Almacena la transacción de pago asociada a una reserva (relación 1:1).
-- Guarda la referencia y el último dígito para validación simulada (RN-04).

CREATE TABLE pago (
    id_pago                SERIAL PRIMARY KEY,
    id_reserva             INTEGER NOT NULL UNIQUE REFERENCES reserva(id_reserva) ON DELETE CASCADE,
    referencia_transaccion VARCHAR(100) NOT NULL,
    ultimo_digito_tarjeta  VARCHAR(1)   NOT NULL,
    estado_pago            VARCHAR(20)  NOT NULL,
    fecha_pago             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- DATOS INICIALES DE PRUEBA
-- Administrador oficial de prueba (para autenticación JWT)
INSERT INTO administrador (nombre, apellido1, apellido2, correo, contrasena_hash, estado)
VALUES ('Betsabe', 'Camaño', 'Godinez', 'betsadasa02@gmail.com', '12345', 'ACTIVO');

-- Destinos turísticos iniciales
INSERT INTO destino (nombre, descripcion, precio_base_persona, capacidad_maxima, estado)
VALUES 
    ('Playa Tamarindo', 'Hermosa playa en Guanacaste con aguas cristalinas.', 85000.00, 10, 'ACTIVO'),
    ('Volcán Arenal', 'Tour al volcán activo más famoso de Costa Rica.', 65000.00, 8, 'ACTIVO'),
    ('Playa Bonita', 'Playita con sol', 55000.00, 5, 'ACTIVO'),
    ('Tortugero', 'Tortuguitas', 35000.00, 7, 'ACTIVO');
