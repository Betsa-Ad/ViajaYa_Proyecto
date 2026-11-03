
// Lógica de autenticación JWT y gestión del Administrador.
import jwt from 'jsonwebtoken';
import { IAdminRepository } from '../interfaces/IAdminRepository';
import { BusinessError } from './reserva.service';

const JWT_SECRET = process.env.JWT_SECRET ?? 'viajaya_secret_dev_2024';

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

  //* Valida credenciales contra la tabla administrador de Supabase y retorna token JWT
  async login(correo?: string, contrasena?: string): Promise<LoginResult> {
    // Valida que ambos campos sean proporcionados
    if (!correo || !contrasena) {
      throw new BusinessError('Datos incompletos', 'Se requiere correo y contraseña.', 400);
    }

    const admin = await this.adminRepo.findByCorreo(correo);

    // Valida existencia del administrador y coincidencia de contraseña
    if (!admin || admin.contrasenaHash !== contrasena) {
      throw new BusinessError('Credenciales inválidas', 'Correo o contraseña incorrectos.', 401);
    }

    // Valida que el administrador se encuentre activo
    if (admin.estado.toUpperCase() !== 'ACTIVO') {
      throw new BusinessError('Cuenta inactiva', 'El usuario administrador está inactivo.', 403);
    }

    // Nombre completo para el token y la respuesta
    const nombreCompleto = [admin.nombre, admin.apellido1, admin.apellido2].filter(Boolean).join(' ').trim();

    // Generación del token JWT firmado con la clave secreta
    const token = jwt.sign(
      {
        id: admin.id,
        correo: admin.correo,
        nombre: nombreCompleto,
        rol: 'ADMIN',
      },
      JWT_SECRET,
      { expiresIn: '8h' }
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
