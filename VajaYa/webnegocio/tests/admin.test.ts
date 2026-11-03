
// Pruebas unitarias para el rol de Gestor/Administrador y JWT.

import { describe, test, expect, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { AdminService } from '../src/services/admin.service';
import { IAdminRepository, Administrador } from '../src/interfaces/IAdminRepository';
import { BusinessError } from '../src/services/reserva.service';

class MockAdminRepository implements IAdminRepository {
  private admins: Administrador[] = [
    {
      id: 1,
      nombre: 'Betsabe',
      apellido1: 'Camaño',
      apellido2: 'Godinez',
      correo: 'betsadasa02@gmail.com',
      contrasenaHash: '12345',
      estado: 'ACTIVO',
    },
    {
      id: 2,
      nombre: 'Inactivo',
      apellido1: 'Test',
      correo: 'inactivo@gmail.com',
      contrasenaHash: '12345',
      estado: 'INACTIVO',
    },
  ];

  async findByCorreo(correo: string): Promise<Administrador | null> {
    return this.admins.find((a) => a.correo.toLowerCase() === correo.toLowerCase().trim()) ?? null;
  }
}

describe('Autenticación y Rol del Administrador', () => {
  let adminService: AdminService;

  beforeEach(() => {
    adminService = new AdminService(new MockAdminRepository());
  });

  test('debe autenticar exitosamente con credenciales válidas y devolver token JWT', async () => {
    const res = await adminService.login('betsadasa02@gmail.com', '12345');

    expect(res).toBeDefined();
    expect(res.token).toBeDefined();
    expect(res.admin.correo).toBe('betsadasa02@gmail.com');
    expect(res.admin.rol).toBe('ADMIN');

    // Verificar que el token JWT es válido y decodificable
    const decoded = jwt.decode(res.token) as any;
    expect(decoded.correo).toBe('betsadasa02@gmail.com');
    expect(decoded.rol).toBe('ADMIN');
  });

  test('debe rechazar el login con contraseña incorrecta', async () => {
    await expect(adminService.login('betsadasa02@gmail.com', 'password_equivocada')).rejects.toThrow(
      BusinessError
    );
  });

  test('debe rechazar el login si el correo no existe', async () => {
    await expect(adminService.login('noexiste@gmail.com', '12345')).rejects.toThrow(
      BusinessError
    );
  });

  test('debe rechazar el login si el administrador está inactivo', async () => {
    await expect(adminService.login('inactivo@gmail.com', '12345')).rejects.toThrow(
      BusinessError
    );
  });

  test('debe rechazar el login si faltan credenciales', async () => {
    await expect(adminService.login('', '')).rejects.toThrow(BusinessError);
  });
});
