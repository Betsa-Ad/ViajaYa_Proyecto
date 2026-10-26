// ============================================================
// app.ts
// Configuración central de la aplicación Express.
// Registra middlewares globales, rutas y el manejador de errores.
// ============================================================

import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import destinoRoutes from './routes/destino.routes';
import cotizacionRoutes from './routes/cotizacion.routes';
import reservaRoutes from './routes/reserva.routes';

const app = express();

// --------------- Middlewares globales ---------------
//* Parsea el body de las peticiones como JSON.
app.use(express.json());

// --------------- Health check ---------------
//* Endpoint de salud para verificar que el servidor está en pie.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', service: 'webnegocio', timestamp: new Date().toISOString() });
});

// --------------- Rutas de la API ---------------
app.use('/api/destinos', destinoRoutes);
app.use('/api/cotizar', cotizacionRoutes);
app.use('/api/reservas', reservaRoutes);

//! El middleware de errores SIEMPRE debe registrarse DESPUÉS de todas las rutas.
app.use(errorMiddleware);

export default app;
