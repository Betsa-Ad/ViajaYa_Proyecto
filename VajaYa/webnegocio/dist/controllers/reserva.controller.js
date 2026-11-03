"use strict";
//* Recibe peticiones HTTP y delega al ReservaService.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaController = void 0;
class ReservaController {
    constructor(service) {
        this.service = service;
        //* Crea una reserva aplicando RN-01, RN-03 y RN-04 — POST /api/reservas
        this.crear = async (req, res, next) => {
            try {
                const reserva = await this.service.crearReserva(req.body);
                res.status(201).json({ data: reserva });
            }
            catch (err) {
                next(err);
            }
        };
        //* Consulta una reserva por ID — GET /api/reservas/:id
        this.obtener = async (req, res, next) => {
            try {
                const reserva = await this.service.obtenerReserva(req.params.id);
                res.status(200).json({ data: reserva });
            }
            catch (err) {
                next(err);
            }
        };
        //* Consulta una reserva por código — GET /api/reservas/codigo/:codigo
        this.obtenerPorCodigo = async (req, res, next) => {
            try {
                const reserva = await this.service.obtenerPorCodigo(req.params.codigo);
                res.status(200).json({ data: reserva });
            }
            catch (err) {
                next(err);
            }
        };
        //* Consulta reservas por correo del cliente — GET /api/reservas/correo/:correo
        this.obtenerPorCorreo = async (req, res, next) => {
            try {
                const reservas = await this.service.obtenerPorCorreo(req.params.correo);
                res.status(200).json({ data: reservas });
            }
            catch (err) {
                next(err);
            }
        };
        //! RN-02: Cancela una reserva respetando la ventana de 48h — PATCH /api/reservas/:id/cancelar
        this.cancelar = async (req, res, next) => {
            try {
                const reserva = await this.service.cancelarReserva(req.params.id);
                res.status(200).json({ data: reserva });
            }
            catch (err) {
                next(err);
            }
        };
        //! RN-02: Reprograma la fecha de viaje respetando la ventana de 48h — PATCH /api/reservas/:id/reprogramar
        this.reprogramar = async (req, res, next) => {
            try {
                const { nuevaFecha } = req.body;
                const reserva = await this.service.reprogramarReserva(req.params.id, nuevaFecha);
                res.status(200).json({ data: reserva });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.ReservaController = ReservaController;
//# sourceMappingURL=reserva.controller.js.map