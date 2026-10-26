
//* Expone el endpoint cotizador puro (RN-03) — sin persistir datos.

import { Request, Response, NextFunction } from 'express';
import { CotizacionService } from '../services/cotizacion.service';

export class CotizacionController {
  constructor(private readonly service: CotizacionService) {}

  //! RN-03: Calcula subtotal, IVA (13%) y total SIN guardar en BD — POST /api/cotizar
  cotizar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { precioBase, numPersonas } = req.body;
      const resultado = this.service.calcular({ precioBase, numPersonas });
      res.status(200).json({ data: resultado });
    } catch (err) {
      next(err);
    }
  };
}
