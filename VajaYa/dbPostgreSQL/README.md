# dbPostgreSQL — Base de Datos

> **Responsable:** Compañera Fabiana

## Descripción
Contiene el schema SQL, migraciones y scripts de seed para la base de datos **PostgreSQL** del sistema ViajaYa.

## Modelo de datos esperado

### Tabla `destinos`
| Columna          | Tipo          | Descripción                        |
|------------------|---------------|------------------------------------|
| id               | UUID (PK)     | Identificador único                |
| nombre           | VARCHAR(100)  | Nombre del destino                 |
| descripcion      | TEXT          | Descripción del destino            |
| precio_base      | DECIMAL(10,2) | Precio base por persona            |
| capacidad_diaria | INTEGER       | Máximo de personas por día         |
| activo           | BOOLEAN       | Estado lógico del destino          |
| created_at       | TIMESTAMP     | Fecha de creación                  |
| updated_at       | TIMESTAMP     | Última actualización               |

### Tabla `reservas`
| Columna      | Tipo          | Descripción                                         |
|--------------|---------------|-----------------------------------------------------|
| id           | UUID (PK)     | Identificador único                                 |
| destino_id   | UUID (FK)     | Referencia a destinos                               |
| cliente_nombre | VARCHAR(100)| Nombre del cliente                                  |
| cliente_email| VARCHAR(150)  | Email del cliente                                   |
| fecha_viaje  | DATE          | Fecha programada del viaje                          |
| num_personas | INTEGER       | Número de personas                                  |
| estado       | ENUM          | 'PENDIENTE', 'CONFIRMADA', 'CANCELADA'              |
| codigo_confirmacion | VARCHAR(20) | Código generado (ej. VY-1234-56)            |
| created_at   | TIMESTAMP     | Fecha de creación                                   |

## Credenciales (desarrollo local)
```
HOST=localhost
PORT=5432
DATABASE=viajaya_db
USER=postgres
PASSWORD=tu_password
```
