// ============================================================
// routes/destino.routes.ts
// Define los 4 endpoints atómicos del CRUD de destinos.
// ============================================================

import { Router } from 'express';
import { DestinoController } from '../controllers/destino.controller';
import { DestinoService } from '../services/destino.service';
import { MockDestinoRepository } from '../mocks/mock.repository';

//* Inyección de dependencias: repositorio Mock reemplazable por el real de webdatos.
const repo = new MockDestinoRepository();
const service = new DestinoService(repo);
const controller = new DestinoController(service);

const router = Router();

// GET  /api/destinos              → Listar destinos activos (también sirve como búsqueda/catálogo)
router.get('/', controller.listarActivos);

// POST /api/destinos              → Crear destino
router.post('/', controller.crear);

// PUT  /api/destinos/:id          → Editar destino completo
router.put('/:id', controller.editar);

//! RN: Desactivación lógica — PATCH en lugar de DELETE para preservar el historial.
// PATCH /api/destinos/:id/desactivar
router.patch('/:id/desactivar', controller.desactivar);

export default router;
