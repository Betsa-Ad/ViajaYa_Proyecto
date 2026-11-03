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
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map