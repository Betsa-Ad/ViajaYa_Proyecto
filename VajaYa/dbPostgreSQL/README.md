# dbPostgreSQL — Base de Datos

> **Responsable:** Compañera Fabiana

## Descripción
Contiene el script DDL oficial (`schema.sql`) y el respaldo completo (`respaldo_viajaya.sql`) para la base de datos **PostgreSQL** (alojada en Supabase) del sistema **ViajaYa**.

## Modelo Entidad-Relación Oficial (5 Tablas en Singular)

### 1. Tabla `administrador`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_administrador | SERIAL | PRIMARY KEY | Identificador numérico del administrador |
| nombre | VARCHAR(100) | NOT NULL | Nombre del gestor |
| apellido1 | VARCHAR(100) | NOT NULL | Primer apellido |
| apellido2 | VARCHAR(100) | | Segundo apellido |
| correo | VARCHAR(150) | NOT NULL UNIQUE | Correo para inicio de sesión |
| contrasena_hash | VARCHAR(255) | NOT NULL | Credencial de acceso |
| estado | VARCHAR(20) | DEFAULT 'ACTIVO' | Estado de la cuenta (ACTIVO / INACTIVO) |

### 2. Tabla `cliente`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_cliente | SERIAL | PRIMARY KEY | Identificador numérico del cliente |
| nombre | VARCHAR(100) | NOT NULL | Nombre del titular de la reserva |
| apellido1 | VARCHAR(100) | NOT NULL | Primer apellido |
| apellido2 | VARCHAR(100) | | Segundo apellido |
| correo | VARCHAR(150) | NOT NULL UNIQUE | Correo único para consultar reservas |
| telefono | VARCHAR(30) | | Teléfono de contacto |

### 3. Tabla `destino`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_destino | SERIAL | PRIMARY KEY | Identificador numérico del destino |
| nombre | VARCHAR(150) | NOT NULL | Nombre del destino turístico |
| descripcion | TEXT | | Reseña o descripción del atractivo |
| precio_base_persona | NUMERIC(10,2) | NOT NULL | Tarifa base por persona |
| capacidad_maxima | INTEGER | NOT NULL | Cupo máximo diario disponible (RN-01) |
| estado | VARCHAR(20) | DEFAULT 'ACTIVO' | Estado lógico (ACTIVO / INACTIVO) |

### 4. Tabla `reserva`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_reserva | SERIAL | PRIMARY KEY | Identificador numérico de la reserva |
| id_cliente | INTEGER | NOT NULL FK (cliente) | Referencia al cliente |
| id_destino | INTEGER | NOT NULL FK (destino) | Referencia al destino |
| codigo_confirmacion | VARCHAR(50) | NOT NULL UNIQUE | Código único generado (`VY-XXXX-XX`) |
| fecha_viaje | DATE | NOT NULL | Fecha programada para el viaje |
| cantidad_personas | INTEGER | NOT NULL | Cantidad de cupos reservados |
| subtotal | NUMERIC(10,2) | NOT NULL | Monto subtotal base |
| iva | NUMERIC(10,2) | NOT NULL | 13% de IVA oficial (RN-03) |
| total | NUMERIC(10,2) | NOT NULL | Total liquidado (subtotal + IVA) |
| estado | VARCHAR(30) | DEFAULT 'CONFIRMADA' | Estado ('CONFIRMADA', 'RECHAZADA', 'CANCELADA') |

### 5. Tabla `pago`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| id_pago | SERIAL | PRIMARY KEY | Identificador numérico del pago |
| id_reserva | INTEGER | NOT NULL UNIQUE FK | Relación 1:1 con la reserva |
| referencia_transaccion | VARCHAR(100) | NOT NULL | Identificador de referencia de transacción |
| ultimo_digito_tarjeta | VARCHAR(1) | NOT NULL | Último dígito de tarjeta para validación (RN-04) |
| estado_pago | VARCHAR(20) | NOT NULL | Estado ('APROBADO', 'RECHAZADO', 'PENDIENTE') |
| fecha_pago | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha y hora del registro del pago |

## Archivos del directorio
- `schema.sql`: Script DDL oficial con la creación de tablas, llaves foráneas y datos semilla iniciales.
- `respaldo_viajaya.sql`: Volcado completo de la base de datos PostgreSQL en Supabase.
