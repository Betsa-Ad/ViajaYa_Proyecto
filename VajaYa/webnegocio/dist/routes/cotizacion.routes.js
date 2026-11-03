"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Endpoint independiente del cotizador puro (RN-03).
const express_1 = require("express");
const cotizacion_controller_1 = require("../controllers/cotizacion.controller");
const cotizacion_service_1 = require("../services/cotizacion.service");
//* El cotizador no necesita repositorio — es lógica pura sin BD.
const service = new cotizacion_service_1.CotizacionService();
const controller = new cotizacion_controller_1.CotizacionController(service);
const router = (0, express_1.Router)();
//Calcula subtotal, IVA y total sin persistir
router.post('/', controller.cotizar);
exports.default = router;
//# sourceMappingURL=cotizacion.routes.js.map