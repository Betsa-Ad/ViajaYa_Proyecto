
//* Recibe peticiones HTTP y delega al ReservaService.

import { Request, Response, NextFunction } from 'express';
import { ReservaService } from '../services/reserva.service';

export class ReservaController {
  constructor(private readonly service: ReservaService) {}

  //* Crea una reserva aplicando RN-01, RN-03 y RN-04 — POST /api/reservas
  crear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reserva = await this.service.crearReserva(req.body);
      res.status(201).json({ data: reserva });
    } catch (err) {
      next(err);
    }
  };

  //* Consulta una reserva por ID — GET /api/reservas/:id
  obtener = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reserva = await this.service.obtenerReserva(req.params.id);
      res.status(200).json({ data: reserva });
    } catch (err) {
      next(err);
    }
  };

  //* Consulta una reserva por código — GET /api/reservas/codigo/:codigo
  obtenerPorCodigo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reserva = await this.service.obtenerPorCodigo(req.params.codigo);
      res.status(200).json({ data: reserva });
    } catch (err) {
      next(err);
    }
  };

  //* Consulta reservas por correo del cliente — GET /api/reservas/correo/:correo
  obtenerPorCorreo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reservas = await this.service.obtenerPorCorreo(req.params.correo);
      res.status(200).json({ data: reservas });
    } catch (err) {
      next(err);
    }
  };

  //! RN-02: Cancela una reserva respetando la ventana de 48h — PATCH /api/reservas/:id/cancelar
  cancelar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reserva = await this.service.cancelarReserva(req.params.id);
      res.status(200).json({ data: reserva });
    } catch (err) {
      next(err);
    }
  };

  //! RN-02: Reprograma la fecha de viaje respetando la ventana de 48h — PATCH /api/reservas/:id/reprogramar
  reprogramar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { nuevaFecha } = req.body;
      const reserva = await this.service.reprogramarReserva(req.params.id, nuevaFecha);
      res.status(200).json({ data: reserva });
    } catch (err) {
      next(err);
    }
  };

  // Consulta cupos disponibles para un destino en una fecha
  consultarCupos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { destinoId } = req.params;
      const fecha = (req.query.fecha as string) || new Date().toISOString().split('T')[0];
      const resultado = await this.service.consultarCuposDisponibles(destinoId, fecha);
      res.status(200).json({ data: resultado });
    } catch (err) {
      next(err);
    }
  };
}
