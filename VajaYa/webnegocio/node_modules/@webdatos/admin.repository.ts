
// Acceso a datos para el Administrador en PostgreSQL (Supabase).
import { pool } from './db.config';
import { Administrador, IAdminRepository } from '../webnegocio/src/interfaces/IAdminRepository';

export class AdminRepository implements IAdminRepository {
  // Busca un administrador por su correo electrónico en la tabla administrador
  async findByCorreo(correo: string): Promise<Administrador | null> {
    const query = `
      SELECT id_administrador, nombre, apellido1, apellido2, correo, contrasena_hash, estado
      FROM administrador
      WHERE LOWER(TRIM(correo)) = LOWER(TRIM($1))
      LIMIT 1
    `;
    const result = await pool.query(query, [correo]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: Number(row.id_administrador),
      nombre: String(row.nombre).trim(),
      apellido1: String(row.apellido1).trim(),
      apellido2: row.apellido2 ? String(row.apellido2).trim() : undefined,
      correo: String(row.correo).trim(),
      contrasenaHash: String(row.contrasena_hash).trim(),
      estado: String(row.estado).trim(),
    };
  }
}
