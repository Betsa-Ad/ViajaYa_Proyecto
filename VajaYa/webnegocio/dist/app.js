"use strict";
// Configuración central de la aplicación Express.
// Registra middlewares globales, rutas y el manejador de errores.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const error_middleware_1 = require("./middlewares/error.middleware");
const destino_routes_1 = __importDefault(require("./routes/destino.routes"));
const cotizacion_routes_1 = __importDefault(require("./routes/cotizacion.routes"));
const reserva_routes_1 = __importDefault(require("./routes/reserva.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
// Middlewares globales 
//* Parsea el body de las peticiones como JSON.
app.use(express_1.default.json());
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
app.use('/api/destinos', destino_routes_1.default);
app.use('/api/cotizar', cotizacion_routes_1.default);
app.use('/api/reservas', reserva_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
//! El middleware de errores SIEMPRE debe registrarse DESPUÉS de todas las rutas.
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
//# sourceMappingURL=app.js.map