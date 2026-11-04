
// Acceso a datos para reservas y pagos en PostgreSQL (Supabase).


import { PoolClient } from 'pg';
import { pool } from './db.config';
import {
  IReservaRepository,
  Reserva,
  EstadoReserva,
  CreateReservaDto,
  ReservaAuditoria,
} from '../webnegocio/src/interfaces/IReservaRepository';

// Mapea las columnas SQL (snake_case) al contrato de TypeScript (camelCase)
function mapReserva(row: any): Reserva {
  const nombreCompleto = [row.cliente_nombre, row.cliente_apellido1, row.cliente_apellido2]
    .filter(Boolean)
    .join(' ');

  return {
    id: String(row.id_reserva),
    destinoId: String(row.id_destino),
    clienteNombre: nombreCompleto,
    clienteEmail: row.cliente_email,
    fechaViaje: row.fecha_viaje,
    numPersonas: Number(row.cantidad_personas),
    subtotal: row.subtotal != null ? Number(row.subtotal) : undefined,
    iva: row.iva != null ? Number(row.iva) : undefined,
    total: row.total != null ? Number(row.total) : undefined,
    estado: row.estado as EstadoReserva,
    codigoConfirmacion: row.codigo_confirmacion,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

export class ReservaRepository implements IReservaRepository {
  // Consulta base común para reutilizar entre búsquedas y evitar duplicar SQL (DRY)
  private readonly selectReservaBase = `
    SELECT 
      r.id_reserva,
      r.id_destino,
      r.id_cliente,
      r.codigo_confirmacion,
      TO_CHAR(r.fecha_viaje, 'YYYY-MM-DD') AS fecha_viaje,
      r.cantidad_personas,
      r.subtotal,
      r.iva,
      r.total,
      r.estado,
      c.nombre AS cliente_nombre,
      c.apellido1 AS cliente_apellido1,
      c.apellido2 AS cliente_apellido2,
      c.correo AS cliente_email
    FROM reserva r
    JOIN cliente c ON r.id_cliente = c.id_cliente
  `;

  // Busca una reserva por su ID numérico
  async findById(id: string): Promise<Reserva | null> {
    const idNum = Number(id);
    if (isNaN(idNum)) return null;

    const query = `${this.selectReservaBase} WHERE r.id_reserva = $1`;
    const result = await pool.query(query, [idNum]);
    if (result.rows.length === 0) return null;
    return mapReserva(result.rows[0]);
  }

  // RN-01: Cuenta las personas ya reservadas para un destino en una fecha (excluyendo canceladas)
  async countPersonasByDestinoAndFecha(destinoId: string, fecha: string): Promise<number> {
    const idNum = Number(destinoId);
    if (isNaN(idNum)) return 0;

    const query = `
      SELECT COALESCE(SUM(cantidad_personas), 0)::integer AS total
      FROM reserva
      WHERE id_destino = $1 AND fecha_viaje = $2 AND estado != 'CANCELADA'
    `;
    const result = await pool.query(query, [idNum, fecha]);
    return Number(result.rows[0].total);
  }

  // Inserta el registro de pago en la tabla pago
  async insertarPago(
    idReserva: number,
    referencia: string,
    ultimoDigito: string,
    estadoPago: string = 'APROBADO',
    client?: PoolClient
  ): Promise<void> {
    const query = `
      INSERT INTO pago (id_reserva, referencia_transaccion, ultimo_digito_tarjeta, estado_pago, fecha_pago)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    const values = [idReserva, referencia, ultimoDigito, estadoPago];
    const runner = client ?? pool;
    await runner.query(query, values);
  }

  // RN-01: Registra la reserva y su pago de forma atómica con bloqueo y validación de cupos
  async create(
    data: CreateReservaDto & { estado: EstadoReserva; codigoConfirmacion: string | null }
  ): Promise<Reserva> {
    const client = await pool.connect();

    try {
      // Inicia la transacción
      await client.query('BEGIN');

      const idDestino = Number(data.destinoId);
      if (isNaN(idDestino)) {
        throw new Error('ID de destino inválido');
      }

      // Bloquea la fila del destino con FOR UPDATE para evitar condiciones de carrera (RN-01)
      const destinoRes = await client.query(
        'SELECT id_destino, capacidad_maxima, precio_base_persona FROM destino WHERE id_destino = $1 FOR UPDATE',
        [idDestino]
      );
      if (destinoRes.rows.length === 0) {
        throw new Error('Destino no encontrado');
      }
      const destino = destinoRes.rows[0];

      // Cuenta los cupos ocupados de forma consistente dentro de la transacción
      const countRes = await client.query(
        `SELECT COALESCE(SUM(cantidad_personas), 0)::integer AS ocupadas
         FROM reserva
         WHERE id_destino = $1 AND fecha_viaje = $2 AND estado != 'CANCELADA'`,
        [idDestino, data.fechaViaje]
      );
      const personasOcupadas = Number(countRes.rows[0].ocupadas);

      // RN-01: Valida que la suma no exceda la capacidad máxima diaria
      if (personasOcupadas + data.numPersonas > destino.capacidad_maxima) {
        const disponibles = destino.capacidad_maxima - personasOcupadas;
        throw new Error(`Cupo insuficiente. Solo quedan ${disponibles} cupo(s) disponibles.`);
      }

      // Separa el nombre completo en partes para la tabla cliente
      const partesNombre = data.clienteNombre.trim().split(/\s+/);
      const nombre = partesNombre[0] || 'Cliente';
      const apellido1 = partesNombre[1] || 'General';
      const apellido2 = partesNombre.slice(2).join(' ') || null;

      // Inserta o actualiza el cliente por su correo único
      const clienteQuery = `
        INSERT INTO cliente (nombre, apellido1, apellido2, correo)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (correo) DO UPDATE 
        SET nombre = EXCLUDED.nombre, apellido1 = EXCLUDED.apellido1
        RETURNING id_cliente
      `;
      const clienteRes = await client.query(clienteQuery, [
        nombre,
        apellido1,
        apellido2,
        data.clienteEmail,
      ]);
      const idCliente = clienteRes.rows[0].id_cliente;

      // RN-03: Calcula subtotal, IVA del 13% y total
      const precioBase = Number(destino.precio_base_persona);
      const subtotal = Math.round(precioBase * data.numPersonas * 100) / 100;
      const iva = Math.round(subtotal * 0.13 * 100) / 100;
      const total = Math.round((subtotal + iva) * 100) / 100;

      // Inserta el registro de la reserva
      const reservaQuery = `
        INSERT INTO reserva (id_cliente, id_destino, codigo_confirmacion, fecha_viaje, cantidad_personas, subtotal, iva, total, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id_reserva
      `;
      const reservaValues = [
        idCliente,
        idDestino,
        data.codigoConfirmacion,
        data.fechaViaje,
        data.numPersonas,
        subtotal,
        iva,
        total,
        data.estado,
      ];
      const reservaRes = await client.query(reservaQuery, reservaValues);
      const idReserva = reservaRes.rows[0].id_reserva;

      // Inserta el registro de pago usando el helper (ultimo_digito_tarjeta es VARCHAR(1))
      const refPago = `REF-${data.codigoConfirmacion ?? idReserva}`;
      const ultimoDigito = data.ultimosDigitosTarjeta ? data.ultimosDigitosTarjeta.slice(-1) : '0';
      await this.insertarPago(idReserva, refPago, ultimoDigito, 'APROBADO', client);

      // Confirma la transacción en la base de datos
      await client.query('COMMIT');

      // Consulta y retorna la reserva creada
      const creada = await this.findById(String(idReserva));
      if (!creada) throw new Error('Error al consultar la reserva creada');
      return creada;
    } catch (error) {
      // Si algo falla, revierte todos los cambios atómicamente
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Libera la conexión de vuelta al pool
      client.release();
    }
  }

  // Actualiza el estado de la reserva (ej. CANCELADA)
  async updateEstado(id: string, estado: EstadoReserva): Promise<Reserva> {
    const idNum = Number(id);
    if (isNaN(idNum)) throw new Error('ID de reserva inválido');

    const query = 'UPDATE reserva SET estado = $1 WHERE id_reserva = $2 RETURNING id_reserva';
    const result = await pool.query(query, [estado, idNum]);
    if (result.rows.length === 0) throw new Error('Reserva no encontrada');

    const reserva = await this.findById(id);
    return reserva!;
  }

  // Actualiza la fecha de viaje de la reserva (reprogramación)
  async updateFecha(id: string, nuevaFecha: string): Promise<Reserva> {
    const idNum = Number(id);
    if (isNaN(idNum)) throw new Error('ID de reserva inválido');

    const query = 'UPDATE reserva SET fecha_viaje = $1 WHERE id_reserva = $2 RETURNING id_reserva';
    const result = await pool.query(query, [nuevaFecha, idNum]);
    if (result.rows.length === 0) throw new Error('Reserva no encontrada');

    const reserva = await this.findById(id);
    return reserva!;
  }

  // Consulta una reserva por su código único de confirmación (ej. VY-1234-56)
  async findByCodigo(codigo: string): Promise<Reserva | null> {
    const query = `${this.selectReservaBase} WHERE r.codigo_confirmacion = $1`;
    const result = await pool.query(query, [codigo]);
    if (result.rows.length === 0) return null;
    return mapReserva(result.rows[0]);
  }

  // Consulta todas las reservas asociadas al correo de un cliente
  async findByCorreo(correo: string): Promise<Reserva[]> {
    const query = `${this.selectReservaBase} WHERE LOWER(c.correo) = LOWER($1) ORDER BY r.id_reserva DESC`;
    const result = await pool.query(query, [correo]);
    return result.rows.map(mapReserva);
  }

  // CAR-06: Consulta todas las reservas registradas para monitoreo y auditoría administrativa
  async findAll(): Promise<ReservaAuditoria[]> {
    const query = `
      SELECT 
        r.id_reserva,
        r.id_destino,
        d.nombre AS destino_nombre,
        r.id_cliente,
        r.codigo_confirmacion,
        TO_CHAR(r.fecha_viaje, 'YYYY-MM-DD') AS fecha_viaje,
        r.cantidad_personas,
        r.subtotal,
        r.iva,
        r.total,
        r.estado,
        c.nombre AS cliente_nombre,
        c.apellido1 AS cliente_apellido1,
        c.apellido2 AS cliente_apellido2,
        c.correo AS cliente_email
      FROM reserva r
      JOIN cliente c ON r.id_cliente = c.id_cliente
      LEFT JOIN destino d ON r.id_destino = d.id_destino
      ORDER BY r.id_reserva DESC
    `;
    const result = await pool.query(query);
    return result.rows.map((row) => ({
      id: String(row.id_reserva),
      destinoId: String(row.id_destino),
      destinoNombre: row.destino_nombre ?? undefined,
      clienteNombre: [row.cliente_nombre, row.cliente_apellido1, row.cliente_apellido2]
        .filter(Boolean)
        .join(' '),
      clienteEmail: row.cliente_email,
      fechaViaje: row.fecha_viaje,
      numPersonas: Number(row.cantidad_personas),
      subtotal: row.subtotal != null ? Number(row.subtotal) : undefined,
      iva: row.iva != null ? Number(row.iva) : undefined,
      total: row.total != null ? Number(row.total) : undefined,
      estado: row.estado as EstadoReserva,
      codigoConfirmacion: row.codigo_confirmacion,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    }));
  }
}
