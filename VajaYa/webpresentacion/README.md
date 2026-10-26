# webpresentacion — Capa de Presentación

> **Responsable:** Compañera Yencita

## Descripción
Esta capa contiene la interfaz de usuario del sistema **ViajaYa**.  
Tecnología sugerida: React / Next.js / HTML+CSS puro.

## Responsabilidades
- Renderizar vistas: catálogo de destinos, formulario de reserva, cotizador, confirmación de pago.
- Consumir la API REST expuesta por `webnegocio` (capa de negocio).
- Gestionar estado de sesión del cliente (token JWT).

## Integración con webnegocio
Base URL de la API (desarrollo local):
```
http://localhost:3000/api
```

## Endpoints que consume
| Método | Endpoint                      | Descripción                     |
|--------|-------------------------------|---------------------------------|
| GET    | /api/destinos                 | Listar destinos activos         |
| POST   | /api/cotizar                  | Cotizar viaje (sin persistir)   |
| POST   | /api/reservas                 | Crear reserva                   |
| GET    | /api/reservas/:id             | Consultar reserva               |
| PATCH  | /api/reservas/:id/cancelar    | Cancelar reserva                |
| PATCH  | /api/reservas/:id/reprogramar | Reprogramar reserva             |
