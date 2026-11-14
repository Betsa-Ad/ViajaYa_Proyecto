"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
// Logica de autenticacion JWT y gestion del Administrador
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const reserva_service_1 = require("./reserva.service");
const JWT_SECRET = process.env.JWT_SECRET || 'viajaya_secret_dev_2024';
class AdminService {
    constructor(adminRepo) {
        this.adminRepo = adminRepo;
    }
    // Valida credenciales contra la tabla administrador y retorna token JWT
    async login(correo, contrasena) {
        if (!correo || !contrasena) {
            throw new reserva_service_1.BusinessError('Datos incompletos', 'Se requiere correo y contraseña.', 400);
        }
        const admin = await this.adminRepo.findByCorreo(correo);
        if (!admin || admin.contrasenaHash !== contrasena) {
            throw new reserva_service_1.BusinessError('Credenciales inválidas', 'Correo o contraseña incorrectos.', 401);
        }
        if (admin.estado.toUpperCase() !== 'ACTIVO') {
            throw new reserva_service_1.BusinessError('Cuenta inactiva', 'El usuario administrador está inactivo.', 403);
        }
        const nombreCompleto = [admin.nombre, admin.apellido1, admin.apellido2].filter(Boolean).join(' ').trim();
        // Generacion del token JWT con vigencia de 30 dias para evitar expiracion en pruebas
        const token = jsonwebtoken_1.default.sign({
            id: admin.id,
            correo: admin.correo,
            nombre: nombreCompleto,
            rol: 'ADMIN',
        }, JWT_SECRET, { expiresIn: '30d' });
        return {
            token,
            admin: {
                id: admin.id,
                nombre: nombreCompleto,
                correo: admin.correo,
                rol: 'ADMIN',
            },
        };
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map