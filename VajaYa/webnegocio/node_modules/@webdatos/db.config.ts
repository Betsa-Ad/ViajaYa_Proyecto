
// Configuración del Pool de conexiones a PostgreSQL en Supabase.
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config(); // Carga las variables de entorno desde el archivo .env

// Configura el pool de conexiones usando la URL con SSL para el Session Pooler
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
