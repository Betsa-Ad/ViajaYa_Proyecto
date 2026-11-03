
// Define los 4 endpoints atómicos del CRUD de destinos.
import { Router } from 'express';
import { DestinoController } from '../controllers/destino.controller';
import { DestinoService } from '../services/destino.service';

// Repositorio real de webdatos conectado a Supabase.
const { DestinoRepository } = require('@webdatos/destino.repository');
import { authMiddleware } from '../middlewares/auth.middleware';

//* Inyección de dependencias: repositorio real conectado a Supabase.
const repo = new DestinoRepository();
const service = new DestinoService(repo);
const controller = new DestinoController(service);

const router = Router();

// Listar destinos activos (público / catálogo)
router.get('/', controller.listarActivos);

// Crear destino (Protegido con JWT - CAR-05)
router.post('/', authMiddleware, controller.crear);

// Editar destino completo (Protegido con JWT - CAR-05)
router.put('/:id', authMiddleware, controller.editar);

//! RN: Desactivación lógica — PATCH en lugar de DELETE para preservar el historial.
// Desactivar destino (Protegido con JWT - CAR-05)
router.patch('/:id/desactivar', authMiddleware, controller.desactivar);

export default router;
