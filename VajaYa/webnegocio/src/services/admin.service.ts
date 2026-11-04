// Logica de autenticacion JWT y gestion del Administrador
import jwt from 'jsonwebtoken';
import { IAdminRepository } from '../interfaces/IAdminRepository';
import { BusinessError } from './reserva.service';

const JWT_SECRET = process.env.JWT_SECRET || 'viajaya_secret_dev_2024';

export interface AdminPayload {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface LoginResult {
  token: string;
  admin: AdminPayload;
}

export class AdminService {
  constructor(private readonly adminRepo: IAdminRepository) {}

  // Valida credenciales contra la tabla administrador y retorna token JWT
  async login(correo?: string, contrasena?: string): Promise<LoginResult> {
    if (!correo || !contrasena) {
      throw new BusinessError('Datos incompletos', 'Se requiere correo y contraseña.', 400);
    }

    const admin = await this.adminRepo.findByCorreo(correo);

    if (!admin || admin.contrasenaHash !== contrasena) {
      throw new BusinessError('Credenciales inválidas', 'Correo o contraseña incorrectos.', 401);
    }

    if (admin.estado.toUpperCase() !== 'ACTIVO') {
      throw new BusinessError('Cuenta inactiva', 'El usuario administrador está inactivo.', 403);
    }

    const nombreCompleto = [admin.nombre, admin.apellido1, admin.apellido2].filter(Boolean).join(' ').trim();

    // Generacion del token JWT con vigencia de 30 dias para evitar expiracion en pruebas
    const token = jwt.sign(
      {
        id: admin.id,
        correo: admin.correo,
        nombre: nombreCompleto,
        rol: 'ADMIN',
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

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
