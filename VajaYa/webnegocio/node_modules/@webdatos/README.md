# webdatos — Capa de Acceso a Datos

> **Responsable:** Compañera Fabiana

## Descripción
Esta capa implementa el **patrón Repository** para aislar el acceso a la base de datos PostgreSQL del resto de la aplicación.

## Responsabilidades
- Implementar las interfaces `IDestinoRepository` e `IReservaRepository` definidas en `webnegocio/src/interfaces/`.
- Realizar las consultas SQL a PostgreSQL usando un ORM  o `pg` directamente.
- Exponer únicamente los métodos que la capa de negocio necesita; no contiene lógica de negocio.

## Contratos que debes implementar
Estas interfaces están definidas en `webnegocio/src/interfaces/`:

```typescript
// IDestinoRepository
findAll(): Promise<Destino[]>
findById(id: string): Promise<Destino | null>
create(data: CreateDestinoDto): Promise<Destino>
update(id: string, data: UpdateDestinoDto): Promise<Destino>
deactivate(id: string): Promise<Destino>

// IReservaRepository
findById(id: string): Promise<Reserva | null>
countPersonasByDestinoAndFecha(destinoId: string, fecha: string): Promise<number>
create(data: CreateReservaDto): Promise<Reserva>
updateEstado(id: string, estado: EstadoReserva): Promise<Reserva>
updateFecha(id: string, nuevaFecha: string): Promise<Reserva>
```

## Conexión a la base de datos
Ver `dbPostgreSQL/` para el schema SQL y credenciales de configuración.
