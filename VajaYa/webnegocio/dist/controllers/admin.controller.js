"use strict";
// Controlador para operaciones del Gestor/Administrador.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
class AdminController {
    constructor(adminService, reservaService) {
        this.adminService = adminService;
        this.reservaService = reservaService;
        //* Autenticación del administrador — POST /api/admin/login
        this.login = async (req, res, next) => {
            try {
                const correo = req.body.correo || req.body.email;
                const contrasena = req.body.contrasena || req.body.password;
                const resultado = await this.adminService.login(correo, contrasena);
                res.status(200).json(resultado);
            }
            catch (err) {
                next(err);
            }
        };
        //* Consulta general de reservas para auditoría — GET /api/admin/reservas (CAR-06)
        this.listarReservas = async (_req, res, next) => {
            try {
                const reservas = await this.reservaService.listarTodas();
                res.status(200).json({ data: reservas, total: reservas.length });
            }
            catch (err) {
                next(err);
            }
        };
        //* RF-08: Cambia el estado de una reserva (CONFIRMADA / CANCELADA) — PATCH /api/admin/reservas/:id/estado
        this.cambiarEstadoReserva = async (req, res, next) => {
            try {
                const { id } = req.params;
                const { estado } = req.body;
                const reserva = await this.reservaService.cambiarEstadoAdmin(id, estado);
                res.status(200).json({ data: reserva });
            }
            catch (err) {
                next(err);
            }
        };
        //* RF-08: Elimina una reserva de la base de datos — DELETE /api/admin/reservas/:id
        this.eliminarReserva = async (req, res, next) => {
            try {
                const { id } = req.params;
                await this.reservaService.eliminarReservaAdmin(id);
                res.status(200).json({ mensaje: 'Reserva eliminada con éxito' });
            }
            catch (err) {
                next(err);
            }
        };
        //* RF-09: Simulación de cobro manual de reserva — PATCH /api/admin/reservas/:id/pago
        this.actualizarPago = async (req, res, next) => {
            try {
                const { id } = req.params;
                const { estadoPago } = req.body;
                const reserva = await this.reservaService.actualizarPagoAdmin(id, estadoPago);
                res.status(200).json({ data: reserva });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map