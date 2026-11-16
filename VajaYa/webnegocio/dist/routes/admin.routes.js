"use strict";
// Rutas administrativas para login y monitoreo de reservas.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const admin_service_1 = require("../services/admin.service");
const reserva_service_1 = require("../services/reserva.service");
// Repositorios reales de webdatos conectados a Supabase.
const { AdminRepository } = require('../../../webdatos/admin.repository.js');
const { ReservaRepository } = require('../../../webdatos/reserva.repository.js');
const { DestinoRepository } = require('../../../webdatos/destino.repository.js');
const auth_middleware_1 = require("../middlewares/auth.middleware");
const adminRepo = new AdminRepository();
const reservaRepo = new ReservaRepository();
const destinoRepo = new DestinoRepository();
const adminService = new admin_service_1.AdminService(adminRepo);
const reservaService = new reserva_service_1.ReservaService(reservaRepo, destinoRepo);
const controller = new admin_controller_1.AdminController(adminService, reservaService);
const router = (0, express_1.Router)();
// Login de administrador (devuelve token JWT)
router.post('/login', controller.login);
// Listar todas las reservas para monitoreo y auditoría (Protegido con JWT - CAR-06)
router.get('/reservas', auth_middleware_1.authMiddleware, controller.listarReservas);
// RF-08: Cambiar estado de una reserva (Protegido con JWT)
router.patch('/reservas/:id/estado', auth_middleware_1.authMiddleware, controller.cambiarEstadoReserva);
// RF-08: Eliminar reserva de la base de datos (Protegido con JWT)
router.delete('/reservas/:id', auth_middleware_1.authMiddleware, controller.eliminarReserva);
// RF-09: Cobro manual y cambio de estado de pago (Protegido con JWT)
router.patch('/reservas/:id/pago', auth_middleware_1.authMiddleware, controller.actualizarPago);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map