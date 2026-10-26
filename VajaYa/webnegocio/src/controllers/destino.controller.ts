
//* Recibe las peticiones HTTP y delega al DestinoService.



import { Request, Response, NextFunction } from 'express';
import { DestinoService } from '../services/destino.service';

export class DestinoController {
  constructor(private readonly service: DestinoService) {}

  //* Lista todos los destinos activos — GET /api/destinos
  listarActivos = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const destinos = await this.service.listarActivos();
      res.status(200).json({ data: destinos });
    } catch (err) {
      next(err);
    }
  };

  //* Crea un nuevo destino — POST /api/destinos
  crear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const destino = await this.service.crear(req.body);
      res.status(201).json({ data: destino });
    } catch (err) {
      next(err);
    }
  };

  //* Edita un destino existente — PUT /api/destinos/:id
  editar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const destino = await this.service.editar(req.params.id, req.body);
      res.status(200).json({ data: destino });
    } catch (err) {
      next(err);
    }
  };

  //! RN: Desactivación lógica del destino — PATCH /api/destinos/:id/desactivar
  desactivar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const destino = await this.service.desactivar(req.params.id);
      res.status(200).json({ data: destino });
    } catch (err) {
      next(err);
    }
  };
}
