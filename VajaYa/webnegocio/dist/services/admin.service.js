"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
// Lógica de autenticación JWT y gestión del Administrador.
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const reserva_service_1 = require("./reserva.service");
const JWT_SECRET = process.env.JWT_SECRET ?? 'viajaya_secret_dev_2024';
class AdminService {
    constructor(adminRepo) {
        this.adminRepo = adminRepo;
    }
    //* Valida credenciales contra la tabla administrador de Supabase y retorna token JWT
    async login(correo, contrasena) {
        // Valida que ambos campos sean proporcionados
        if (!correo || !contrasena) {
            throw new reserva_service_1.BusinessError('Datos incompletos', 'Se requiere correo y contraseña.', 400);
        }
        const admin = await this.adminRepo.findByCorreo(correo);
        // Valida existencia del administrador y coincidencia de contraseña
        if (!admin || admin.contrasenaHash !== contrasena) {
            throw new reserva_service_1.BusinessError('Credenciales inválidas', 'Correo o contraseña incorrectos.', 401);
        }
        // Valida que el administrador se encuentre activo
        if (admin.estado.toUpperCase() !== 'ACTIVO') {
            throw new reserva_service_1.BusinessError('Cuenta inactiva', 'El usuario administrador está inactivo.', 403);
        }
        // Nombre completo para el token y la respuesta
        const nombreCompleto = [admin.nombre, admin.apellido1, admin.apellido2].filter(Boolean).join(' ').trim();
        // Generación del token JWT firmado con la clave secreta
        const token = jsonwebtoken_1.default.sign({
            id: admin.id,
            correo: admin.correo,
            nombre: nombreCompleto,
            rol: 'ADMIN',
        }, JWT_SECRET, { expiresIn: '8h' });
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