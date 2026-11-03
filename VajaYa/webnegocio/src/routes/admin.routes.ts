
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

//listar todas las reservas para monitoreo y auditoría (Protegido con JWT - CAR-06)
router.get('/reservas', authMiddleware, controller.listarReservas);

export default router;
