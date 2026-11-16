"use strict";
// Clases de error y validaciones compartidas del negocio.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessError = void 0;
exports.validarCantidadPersonas = validarCantidadPersonas;
//* Error de negocio personalizado con código HTTP y título RFC 7807.
class BusinessError extends Error {
    constructor(title, message, statusCode = 400) {
        super(message);
        this.title = title;
        this.statusCode = statusCode;
        this.name = 'BusinessError';
    }
}
exports.BusinessError = BusinessError;
//! Valida que la cantidad de personas sea un número entero estricto mayor o igual a 1.
function validarCantidadPersonas(numPersonas) {
    if (typeof numPersonas !== 'number' ||
        !Number.isInteger(numPersonas) ||
        numPersonas < 1) {
        throw new BusinessError('Cantidad de personas inválida', 'El número de personas debe ser un entero positivo.', 400);
    }
    return numPersonas;
}
//# sourceMappingURL=validaciones.js.map