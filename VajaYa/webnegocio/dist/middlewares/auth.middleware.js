"use strict";
// Middleware básico de autenticación JWT.
// Verifica que el token sea válido antes de acceder a rutas protegidas.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET ?? 'viajaya_secret_dev_2024';
//! El token JWT debe enviarse en el header Authorization con formato 'Bearer <token>'.
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            type: 'https://viajaya.com/errors/no-autorizado',
            title: 'No autorizado',
            status: 401,
            detail: 'Se requiere un token de autenticación válido.',
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        //* Verifica la firma y expiración del token; si es válido, agrega el payload a req.
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        //! Token inválido o expirado — se rechaza la solicitud.
        res.status(401).json({
            type: 'https://viajaya.com/errors/token-invalido',
            title: 'Token inválido',
            status: 401,
            detail: 'El token proporcionado es inválido o ha expirado.',
        });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map