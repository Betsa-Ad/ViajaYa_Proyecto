import type { Administrador, IAdminRepository } from '../webnegocio/src/interfaces/IAdminRepository';
export declare class AdminRepository implements IAdminRepository {
    findByCorreo(correo: string): Promise<Administrador | null>;
}
