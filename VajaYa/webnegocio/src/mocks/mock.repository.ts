
// Implementación en memoria de IDestinoRepository e IReservaRepository.
//! SOLO para desarrollo y pruebas locales 
// Cuando webdatos esté listo, se inyectan las implementaciones reales.


import { v4 as uuidv4 } from 'uuid';
import {
  IDestinoRepository,
  Destino,
  CreateDestinoDto,
  UpdateDestinoDto,
} from '../interfaces/IDestinoRepository';
import {
  IReservaRepository,
  Reserva,
  EstadoReserva,
  CreateReservaDto,
  ReservaAuditoria,
} from '../interfaces/IReservaRepository';

// MOCK DESTINOS 

//* Repositorio en memoria para Destinos — simula la BD sin necesitar webdatos.
export class MockDestinoRepository implements IDestinoRepository {
  private destinos: Destino[] = [
    {
      id: 'dest-001',
      nombre: 'Playa Tamarindo',
      descripcion: 'Hermosa playa en Guanacaste con aguas cristalinas.',
      precioBase: 85000,
      capacidadDiaria: 10,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dest-002',
      nombre: 'Volcán Arenal',
      descripcion: 'Tour al volcán activo más famoso de Costa Rica.',
      precioBase: 65000,
      capacidadDiaria: 8,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  //* Retorna todos los destinos marcados como activos.
  async findAll(): Promise<Destino[]> {
    return this.destinos.filter((d) => d.activo);
  }

  //* Busca un destino por su ID (activo o no).
  async findById(id: string): Promise<Destino | null> {
    return this.destinos.find((d) => d.id === id) ?? null;
  }

  //* Inserta un nuevo destino en el arreglo en memoria.
  async create(data: CreateDestinoDto): Promise<Destino> {
    const nuevo: Destino = {
      id: uuidv4(),
      ...data,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.destinos.push(nuevo);
    return nuevo;
  }

  //* Actualiza los campos enviados de un destino existente.
  async update(id: string, data: UpdateDestinoDto): Promise<Destino> {
    const index = this.destinos.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Destino no encontrado');
    this.destinos[index] = { ...this.destinos[index], ...data, updatedAt: new Date() };
    return this.destinos[index];
  }

  //! RN: Desactivación lógica — nunca se borra el registro de la BD.
  async deactivate(id: string): Promise<Destino> {
    const index = this.destinos.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Destino no encontrado');
    this.destinos[index].activo = false;
    this.destinos[index].updatedAt = new Date();
    return this.destinos[index];
  }
}

//MOCK RESERVAS 

//* Repositorio en memoria para Reservas — simula la BD sin necesitar webdatos.
export class MockReservaRepository implements IReservaRepository {
  private reservas: Reserva[] = [];

  //* Busca una reserva por su ID.
  async findById(id: string): Promise<Reserva | null> {
    return this.reservas.find((r) => r.id === id) ?? null;
  }

  //! RN-01: Suma las personas ya reservadas para ese destino y fecha (para validar cupo).
  async countPersonasByDestinoAndFecha(destinoId: string, fecha: string): Promise<number> {
    return this.reservas
      .filter(
        (r) =>
          r.destinoId === destinoId &&
          r.fechaViaje === fecha &&
          r.estado !== 'CANCELADA'
      )
      .reduce((sum, r) => sum + r.numPersonas, 0);
  }

  //* Inserta una nueva reserva con estado y código ya calculados por el servicio.
  async create(
    data: CreateReservaDto & { estado: EstadoReserva; codigoConfirmacion: string | null }
  ): Promise<Reserva> {
    const nueva: Reserva = {
      id: uuidv4(),
      destinoId: data.destinoId,
      clienteNombre: data.clienteNombre,
      clienteEmail: data.clienteEmail,
      fechaViaje: data.fechaViaje,
      numPersonas: data.numPersonas,
      estado: data.estado,
      codigoConfirmacion: data.codigoConfirmacion,
      createdAt: new Date(),
    };
    this.reservas.push(nueva);
    return nueva;
  }

  //* Actualiza solo el estado de una reserva (ej. CANCELADA).
  async updateEstado(id: string, estado: EstadoReserva): Promise<Reserva> {
    const index = this.reservas.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Reserva no encontrada');
    this.reservas[index].estado = estado;
    return this.reservas[index];
  }

  //* Actualiza solo la fecha de viaje de una reserva (reprogramación).
  async updateFecha(id: string, nuevaFecha: string): Promise<Reserva> {
    const index = this.reservas.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Reserva no encontrada');
    this.reservas[index].fechaViaje = nuevaFecha;
    return this.reservas[index];
  }

  //* Consulta una reserva por su código de confirmación.
  async findByCodigo(codigo: string): Promise<Reserva | null> {
    return this.reservas.find((r) => r.codigoConfirmacion === codigo) ?? null;
  }

  //* Consulta reservas por el correo del cliente.
  async findByCorreo(correo: string): Promise<Reserva[]> {
    return this.reservas.filter((r) => r.clienteEmail.toLowerCase() === correo.toLowerCase());
  }

  //* Consulta todas las reservas (para monitoreo y pruebas de auditoría).
  async findAll(): Promise<ReservaAuditoria[]> {
    return this.reservas;
  }
}
