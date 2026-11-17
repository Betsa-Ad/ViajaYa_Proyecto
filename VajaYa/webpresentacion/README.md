# webpresentacion — Capa de Presentación

> **Responsable:** Compañera Yencita

## Descripción
Esta capa contiene la interfaz de usuario tipo SPA (Single Page Application) del sistema **ViajaYa**, construida con **React** y **Vite**.

## Responsabilidades
- Renderizar vistas públicas: catálogo de destinos turísticos con filtrado en tiempo real, cotizador automático e información institucional.
- Gestionar reservas turísticas: formulario de reserva, consulta de cupos disponibles y emisión formal de comprobante con opción de descarga PDF.
- Autogestión de reservas para turistas: consulta, reprogramación y cancelación directa mediante **Código Único de Confirmación (`VY-XXXX-XX`) + Correo Electrónico**, sin contraseñas ni registros previos.
- Panel Administrativo protegido: autenticación mediante **JWT (JSON Web Token)** exclusiva para el personal gestor/administrador (`/admin`).
- Consumir la API REST expuesta por `webnegocio` mediante `src/services/api.js`.

## Integración con webnegocio
Base URL de la API (desarrollo local / producción Render):
```
http://localhost:3000/api
```

## Endpoints que consume

### Públicos y Clientes (Sin autenticación)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/destinos` | Listar catálogo de destinos activos |
| GET | `/api/reservas/cupos/:destinoId?fecha=...` | Consultar cupos disponibles en fecha específica |
| POST | `/api/cotizar` | Cotizar tarifa con desglose de subtotal e IVA 13% |
| POST | `/api/reservas` | Registrar nueva reserva con pasarela simulada |
| GET | `/api/reservas/codigo/:codigo?correo=...` | Consultar reserva por código único y correo |
| PATCH | `/api/reservas/:id/reprogramar` | Reprogramar fecha respetando ventana de 48h |
| PATCH | `/api/reservas/:id/cancelar` | Cancelar reserva respetando ventana de 48h |

### Administrativos (Protegidos con JWT - Bearer Token)
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/admin/login` | Iniciar sesión del administrador y obtener token JWT |
| GET | `/api/admin/reservas` | Listar todas las reservas registradas (Auditoría) |
| POST | `/api/destinos` | Crear nuevo destino turístico |
| PUT | `/api/destinos/:id` | Editar destino turístico existente |
| PATCH | `/api/destinos/:id/desactivar` | Desactivar lógicamente un destino |
| PATCH | `/api/admin/reservas/:id/estado` | Cambiar estado de una reserva (Aprobar/Cancelar) |
| DELETE | `/api/admin/reservas/:id` | Eliminar permanentemente una reserva |
| PATCH | `/api/admin/reservas/:id/pago` | Actualizar estado del pago simulado |
