"use strict";
// Manejador centralizado de errores con formato RFC 7807.
// Todas las rutas pasan por aquí cuando llaman next(err).
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const reserva_service_1 = require("../services/reserva.service");
//* Middleware de error final — captura cualquier error y lo formatea como RFC 7807.
const errorMiddleware = (err, _req, res, _next) => {
    let status = 500;
    let title = 'Error interno del servidor';
    let detail = 'Ocurrió un error inesperado. Intente de nuevo más tarde.';
    //! Si es un BusinessError definido por nosotros, usamos sus datos tipados.
    if (err instanceof reserva_service_1.BusinessError) {
        status = err.statusCode;
        title = err.title;
        detail = err.message;
    }
    else if (err instanceof SyntaxError) {
        // JSON malformado en el body
        status = 400;
        title = 'Solicitud malformada';
        detail = 'El cuerpo de la solicitud contiene JSON inválido.';
    }
    const problem = {
        type: `https://viajaya.com/errors/${toKebabCase(title)}`,
        title,
        status,
        detail,
    };
    res.status(status).json(problem);
};
exports.errorMiddleware = errorMiddleware;
//* Convierte un título a formato kebab-case para la URI del tipo de error.
function toKebabCase(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}
//# sourceMappingURL=error.middleware.js.map