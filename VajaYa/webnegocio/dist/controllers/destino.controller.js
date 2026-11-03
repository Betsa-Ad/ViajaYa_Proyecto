"use strict";
//* Recibe las peticiones HTTP y delega al DestinoService.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinoController = void 0;
class DestinoController {
    constructor(service) {
        this.service = service;
        //* Lista todos los destinos activos — GET /api/destinos
        this.listarActivos = async (_req, res, next) => {
            try {
                const destinos = await this.service.listarActivos();
                res.status(200).json({ data: destinos });
            }
            catch (err) {
                next(err);
            }
        };
        //* Crea un nuevo destino — POST /api/destinos
        this.crear = async (req, res, next) => {
            try {
                const destino = await this.service.crear(req.body);
                res.status(201).json({ data: destino });
            }
            catch (err) {
                next(err);
            }
        };
        //* Edita un destino existente — PUT /api/destinos/:id
        this.editar = async (req, res, next) => {
            try {
                const destino = await this.service.editar(req.params.id, req.body);
                res.status(200).json({ data: destino });
            }
            catch (err) {
                next(err);
            }
        };
        //! RN: Desactivación lógica del destino — PATCH /api/destinos/:id/desactivar
        this.desactivar = async (req, res, next) => {
            try {
                const destino = await this.service.desactivar(req.params.id);
                res.status(200).json({ data: destino });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.DestinoController = DestinoController;
//# sourceMappingURL=destino.controller.js.map