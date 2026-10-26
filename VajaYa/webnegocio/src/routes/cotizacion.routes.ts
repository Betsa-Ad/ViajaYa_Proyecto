// ============================================================
// routes/cotizacion.routes.ts
// Endpoint independiente del cotizador puro (RN-03).
// ============================================================

import { Router } from 'express';
import { CotizacionController } from '../controllers/cotizacion.controller';
import { CotizacionService } from '../services/cotizacion.service';

//* El cotizador no necesita repositorio — es lógica pura sin BD.
const service = new CotizacionService();
const controller = new CotizacionController(service);

const router = Router();

// POST /api/cotizar → Calcula subtotal, IVA y total sin persistir
router.post('/', controller.cotizar);

export default router;
