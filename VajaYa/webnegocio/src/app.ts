
// Configuración central de la aplicación Express.
// Registra middlewares globales, rutas y el manejador de errores.

import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import destinoRoutes from './routes/destino.routes';
import cotizacionRoutes from './routes/cotizacion.routes';
import reservaRoutes from './routes/reserva.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Middlewares globales 
//* Parsea el body de las peticiones como JSON.
app.use(express.json());

//* Habilita CORS para permitir peticiones desde el frontend webpresentacion.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Health check 
//* Endpoint de salud para verificar que el servidor está en pie.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', service: 'webnegocio', timestamp: new Date().toISOString() });
});

//  Rutas de la API 
app.use('/api/destinos', destinoRoutes);
app.use('/api/cotizar', cotizacionRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/admin', adminRoutes);

//! El middleware de errores SIEMPRE debe registrarse DESPUÉS de todas las rutas.
app.use(errorMiddleware);

export default app;
