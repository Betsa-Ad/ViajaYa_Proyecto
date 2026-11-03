"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Define los 4 endpoints atómicos del CRUD de destinos.
const express_1 = require("express");
const destino_controller_1 = require("../controllers/destino.controller");
const destino_service_1 = require("../services/destino.service");
// Repositorio real de webdatos conectado a Supabase.
const { DestinoRepository } = require('@webdatos/destino.repository');
const auth_middleware_1 = require("../middlewares/auth.middleware");
//* Inyección de dependencias: repositorio real conectado a Supabase.
const repo = new DestinoRepository();
const service = new destino_service_1.DestinoService(repo);
const controller = new destino_controller_1.DestinoController(service);
const router = (0, express_1.Router)();
// Listar destinos activos (público / catálogo)
router.get('/', controller.listarActivos);
// Crear destino (Protegido con JWT - CAR-05)
router.post('/', auth_middleware_1.authMiddleware, controller.crear);
// Editar destino completo (Protegido con JWT - CAR-05)
router.put('/:id', auth_middleware_1.authMiddleware, controller.editar);
//! RN: Desactivación lógica — PATCH en lugar de DELETE para preservar el historial.
// Desactivar destino (Protegido con JWT - CAR-05)
router.patch('/:id/desactivar', auth_middleware_1.authMiddleware, controller.desactivar);
exports.default = router;
//# sourceMappingURL=destino.routes.js.map