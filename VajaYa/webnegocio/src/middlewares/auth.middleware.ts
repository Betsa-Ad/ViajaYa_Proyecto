// Middleware de autenticacion JWT para rutas protegidas
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'viajaya_secret_dev_2024';

// Verifica la presencia y validez del token en el encabezado Authorization
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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
    const payload = jwt.verify(token, JWT_SECRET);
    (req as Request & { user: unknown }).user = payload;
    next();
  } catch {
    res.status(401).json({
      type: 'https://viajaya.com/errors/token-invalido',
      title: 'Token inválido',
      status: 401,
      detail: 'El token proporcionado es inválido o ha expirado.',
    });
  }
};
