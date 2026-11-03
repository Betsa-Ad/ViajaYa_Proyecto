
// Acceso a datos para destinos en PostgreSQL (Supabase).
import { pool } from './db.config';
import {IDestinoRepository, Destino, CreateDestinoDto,UpdateDestinoDto, } from '../webnegocio/src/interfaces/IDestinoRepository';

// Mapea una fila de la base de datos (snake_case) al modelo de negocio (camelCase)
function mapDestino(row: any): Destino {
  return {
    id: String(row.id_destino),
    nombre: row.nombre,
    descripcion: row.descripcion ?? '',
    precioBase: Number(row.precio_base_persona),
    capacidadDiaria: Number(row.capacidad_maxima),
    activo: typeof row.estado === 'string' && row.estado.trim().toUpperCase() === 'ACTIVO',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
}

export class DestinoRepository implements IDestinoRepository {
  // Lista todos los destinos con estado ACTIVO directamente desde Supabase
  async findAll(): Promise<Destino[]> {
    const query = `
      SELECT id_destino, nombre, descripcion, precio_base_persona, capacidad_maxima, estado
      FROM destino
      WHERE TRIM(estado) ILIKE 'ACTIVO'
      ORDER BY id_destino ASC
    `;
    const result = await pool.query(query);
    // Transforma cada fila al modelo de TypeScript
    return result.rows.map(mapDestino);
  }

  // Busca un destino por su identificador primario
  async findById(id: string): Promise<Destino | null> {
    const idNum = Number(id);
    // Si el identificador no es numero, retorna null 
    if (isNaN(idNum)) return null;

    const query = `
      SELECT id_destino, nombre, descripcion, precio_base_persona, capacidad_maxima, estado
      FROM destino
      WHERE id_destino = $1
    `;
    const result = await pool.query(query, [idNum]);
    if (result.rows.length === 0) return null;
    return mapDestino(result.rows[0]);
  }

  // Crea un nuevo registro de destino en la base de datos
  async create(data: CreateDestinoDto): Promise<Destino> {
    const query = `
      INSERT INTO destino (nombre, descripcion, precio_base_persona, capacidad_maxima, estado)
      VALUES ($1, $2, $3, $4, 'ACTIVO')
      RETURNING id_destino, nombre, descripcion, precio_base_persona, capacidad_maxima, estado
    `;
    const values = [data.nombre, data.descripcion, data.precioBase, data.capacidadDiaria];
    const result = await pool.query(query, values);
    return mapDestino(result.rows[0]);
  }

  // Actualiza los campos especificados de un destino
  async update(id: string, data: UpdateDestinoDto): Promise<Destino> {
    const query = `
      UPDATE destino
      SET 
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        precio_base_persona = COALESCE($3, precio_base_persona),
        capacidad_maxima = COALESCE($4, capacidad_maxima)
      WHERE id_destino = $5
      RETURNING id_destino, nombre, descripcion, precio_base_persona, capacidad_maxima, estado
    `;
    const values = [
      data.nombre ?? null,
      data.descripcion ?? null,
      data.precioBase ?? null,
      data.capacidadDiaria ?? null,
      Number(id),
    ];
    const result = await pool.query(query, values);
    return mapDestino(result.rows[0]);
  }

  // Desactiva un destino cambiando su estado a INACTIVO
  async deactivate(id: string): Promise<Destino> {
    const query = `
      UPDATE destino
      SET estado = 'INACTIVO'
      WHERE id_destino = $1
      RETURNING id_destino, nombre, descripcion, precio_base_persona, capacidad_maxima, estado
    `;
    const result = await pool.query(query, [Number(id)]);
    return mapDestino(result.rows[0]);
  }
}
