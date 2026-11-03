
// Define los endpoints de gestión de reservas.

import { Router } from 'express';
import { ReservaController } from '../controllers/reserva.controller';
import { ReservaService } from '../services/reserva.service';

// Repositorios reales de webdatos conectados a Supabase.
const { ReservaRepository } = require('@webdatos/reserva.repository');
const { DestinoRepository } = require('@webdatos/destino.repository');

//* Inyección de dependencias: repositorios reales conectados a Supabase.
const reservaRepo = new ReservaRepository();
const destinoRepo = new DestinoRepository();
const service = new ReservaService(reservaRepo, destinoRepo);
const controller = new ReservaController(service);

const router = Router();

//Crear reserva (aplica RN-01, RN-03, RN-04)
router.post('/', controller.crear);

// Consultar reserva por código de confirmación
router.get('/codigo/:codigo', controller.obtenerPorCodigo);

// Consultar reservas por correo del cliente
router.get('/correo/:correo', controller.obtenerPorCorreo);

//Consultar reserva por ID
router.get('/:id', controller.obtener);

//! RN-02: Solo se permite cancelar/reprogramar con más de 48 horas de anticipación.
router.patch('/:id/cancelar', controller.cancelar);

router.patch('/:id/reprogramar', controller.reprogramar);

export default router;
