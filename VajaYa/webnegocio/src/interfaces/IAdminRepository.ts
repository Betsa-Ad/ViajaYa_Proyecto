
// Contratos para el acceso a datos del Administrador / Gestor.


export interface Administrador {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  correo: string;
  contrasenaHash: string;
  estado: string;
}

export interface IAdminRepository {
  findByCorreo(correo: string): Promise<Administrador | null>;
}
