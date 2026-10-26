// ============================================================
// routes/reserva.routes.ts
// Define los endpoints de gestión de reservas.
// ============================================================

import { Router } from 'express';
import { ReservaController } from '../controllers/reserva.controller';
import { ReservaService } from '../services/reserva.service';
import { MockReservaRepository, MockDestinoRepository } from '../mocks/mock.repository';

//* Inyección de dependencias: ambos repositorios Mock reemplazables por los reales.
const reservaRepo = new MockReservaRepository();
const destinoRepo = new MockDestinoRepository();
const service = new ReservaService(reservaRepo, destinoRepo);
const controller = new ReservaController(service);

const router = Router();

// POST  /api/reservas              → Crear reserva (aplica RN-01, RN-03, RN-04)
router.post('/', controller.crear);

// GET   /api/reservas/:id          → Consultar reserva por ID
router.get('/:id', controller.obtener);

//! RN-02: Solo se permite cancelar/reprogramar con más de 48 horas de anticipación.
// PATCH /api/reservas/:id/cancelar
router.patch('/:id/cancelar', controller.cancelar);

// PATCH /api/reservas/:id/reprogramar
router.patch('/:id/reprogramar', controller.reprogramar);

export default router;
