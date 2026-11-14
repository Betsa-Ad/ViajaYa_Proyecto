
// Rutas administrativas para login y monitoreo de reservas.

import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { AdminService } from '../services/admin.service';
import { ReservaService } from '../services/reserva.service';

// Repositorios reales de webdatos conectados a Supabase.
const { AdminRepository } = require('@webdatos/admin.repository');
const { ReservaRepository } = require('@webdatos/reserva.repository');
const { DestinoRepository } = require('@webdatos/destino.repository');
import { authMiddleware } from '../middlewares/auth.middleware';

const adminRepo = new AdminRepository();
const reservaRepo = new ReservaRepository();
const destinoRepo = new DestinoRepository();

const adminService = new AdminService(adminRepo);
const reservaService = new ReservaService(reservaRepo, destinoRepo);

const controller = new AdminController(adminService, reservaService);

const router = Router();

// Login de administrador (devuelve token JWT)
router.post('/login', controller.login);

// Listar todas las reservas para monitoreo y auditoría (Protegido con JWT - CAR-06)
router.get('/reservas', authMiddleware, controller.listarReservas);

// RF-08: Cambiar estado de una reserva (Protegido con JWT)
router.patch('/reservas/:id/estado', authMiddleware, controller.cambiarEstadoReserva);

// RF-08: Eliminar reserva de la base de datos (Protegido con JWT)
router.delete('/reservas/:id', authMiddleware, controller.eliminarReserva);

// RF-09: Cobro manual y cambio de estado de pago (Protegido con JWT)
router.patch('/reservas/:id/pago', authMiddleware, controller.actualizarPago);

export default router;
