
// Controlador para operaciones del Gestor/Administrador.

import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ReservaService } from '../services/reserva.service';

export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly reservaService: ReservaService
  ) {}

  //* Autenticación del administrador — POST /api/admin/login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const correo = req.body.correo || req.body.email;
      const contrasena = req.body.contrasena || req.body.password;
      const resultado = await this.adminService.login(correo, contrasena);
      res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  //* Consulta general de reservas para auditoría — GET /api/admin/reservas (CAR-06)
  listarReservas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reservas = await this.reservaService.listarTodas();
      res.status(200).json({ data: reservas, total: reservas.length });
    } catch (err) {
      next(err);
    }
  };
}
