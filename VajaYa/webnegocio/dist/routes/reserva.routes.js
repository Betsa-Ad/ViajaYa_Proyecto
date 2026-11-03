"use strict";
// Define los endpoints de gestión de reservas.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reserva_controller_1 = require("../controllers/reserva.controller");
const reserva_service_1 = require("../services/reserva.service");
// Repositorios reales de webdatos conectados a Supabase.
const { ReservaRepository } = require('@webdatos/reserva.repository');
const { DestinoRepository } = require('@webdatos/destino.repository');
//* Inyección de dependencias: repositorios reales conectados a Supabase.
const reservaRepo = new ReservaRepository();
const destinoRepo = new DestinoRepository();
const service = new reserva_service_1.ReservaService(reservaRepo, destinoRepo);
const controller = new reserva_controller_1.ReservaController(service);
const router = (0, express_1.Router)();
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
exports.default = router;
//# sourceMappingURL=reserva.routes.js.map