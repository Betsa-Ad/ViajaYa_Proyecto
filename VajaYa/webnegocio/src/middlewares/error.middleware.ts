// ============================================================
// middlewares/error.middleware.ts
// Manejador centralizado de errores con formato RFC 7807.
// Todas las rutas pasan por aquí cuando llaman next(err).
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { BusinessError } from '../services/reserva.service';

//! RFC 7807: Estructura estándar para todas las respuestas de error de la API.
interface ProblemDetail {
  type: string;      // URI que identifica el tipo de problema
  title: string;     // Descripción corta legible del problema
  status: number;    // Código HTTP
  detail: string;    // Explicación detallada del error específico
}

//* Middleware de error final — captura cualquier error y lo formatea como RFC 7807.
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let status = 500;
  let title = 'Error interno del servidor';
  let detail = 'Ocurrió un error inesperado. Intente de nuevo más tarde.';

  //! Si es un BusinessError definido por nosotros, usamos sus datos tipados.
  if (err instanceof BusinessError) {
    status = err.statusCode;
    title = err.title;
    detail = err.message;
  } else if (err instanceof SyntaxError) {
    // JSON malformado en el body
    status = 400;
    title = 'Solicitud malformada';
    detail = 'El cuerpo de la solicitud contiene JSON inválido.';
  }

  const problem: ProblemDetail = {
    type: `https://viajaya.com/errors/${toKebabCase(title)}`,
    title,
    status,
    detail,
  };

  res.status(status).json(problem);
};

//* Convierte un título a formato kebab-case para la URI del tipo de error.
function toKebabCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
