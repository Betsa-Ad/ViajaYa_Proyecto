
// Contrato que webdatos debe implementar para reservas.

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';

export interface Reserva {
  id: string;
  destinoId: string;
  clienteNombre: string;
  clienteEmail: string;
  fechaViaje: string; // 'YYYY-MM-DD'
  numPersonas: number;
  estado: EstadoReserva;
  codigoConfirmacion: string | null;
  createdAt: Date;
}

// Detalle ampliado de la reserva para monitoreo y auditoría administrativa (CAR-06)
export interface ReservaAuditoria extends Reserva {
  destinoNombre?: string;
  subtotal?: number;
  iva?: number;
  total?: number;
}

export interface CreateReservaDto {
  destinoId: string;
  clienteNombre: string;
  clienteEmail: string;
  fechaViaje: string;
  numPersonas: number;
  ultimosDigitosTarjeta: string; // solo últimos 4 dígitos
}

//* Contrato (interfaz) que la capa webdatos debe implementar para gestionar reservas.
export interface IReservaRepository {
  findById(id: string): Promise<Reserva | null>;
  countPersonasByDestinoAndFecha(destinoId: string, fecha: string): Promise<number>;
  create(data: CreateReservaDto & { estado: EstadoReserva; codigoConfirmacion: string | null }): Promise<Reserva>;
  updateEstado(id: string, estado: EstadoReserva): Promise<Reserva>;
  updateFecha(id: string, nuevaFecha: string): Promise<Reserva>;
  findByCodigo?(codigo: string): Promise<Reserva | null>;
  findByCorreo?(correo: string): Promise<Reserva[]>;
  findAll?(): Promise<ReservaAuditoria[]>;
}
