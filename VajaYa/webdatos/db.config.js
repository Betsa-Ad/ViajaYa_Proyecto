"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// Configuración del Pool de conexiones a PostgreSQL en Supabase.
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Carga las variables de entorno desde el archivo .env
// Configura el pool de conexiones usando la URL con SSL para el Session Pooler
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
