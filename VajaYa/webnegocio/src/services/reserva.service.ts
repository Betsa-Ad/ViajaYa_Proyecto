
// Lógica de negocio para reservas: aplica RN-01, RN-02 y RN-04.
import { v4 as uuidv4 } from 'uuid';
import { IDestinoRepository } from '../interfaces/IDestinoRepository';
import {
  IReservaRepository,
  Reserva,
  EstadoReserva,
  CreateReservaDto,
  ReservaAuditoria,
} from '../interfaces/IReservaRepository';
import { CotizacionService } from './cotizacion.service';
import { BusinessError, validarCantidadPersonas } from './validaciones';

export { BusinessError, validarCantidadPersonas };

// Servicio 

export class ReservaService {
  private readonly cotizacionService = new CotizacionService();

  constructor(
    private readonly reservaRepo: IReservaRepository,
    private readonly destinoRepo: IDestinoRepository
  ) {}

  //* Crea una reserva aplicando RN-01 (cupos), RN-03 (tarifa) y RN-04 (pago simulado).
  async crearReserva(data: CreateReservaDto): Promise<Reserva> {
    //! Valida que la cantidad de personas sea un entero estricto mayor o igual a 1.
    validarCantidadPersonas(data.numPersonas);

    // Verificar que el destino existe y está activo
    const destino = await this.destinoRepo.findById(data.destinoId);
    if (!destino || !destino.activo) {
      throw new BusinessError('Destino no disponible', 'El destino no existe o está desactivado.', 404);
    }

    //! RN-01: Validar que las personas ya reservadas + nuevas no excedan la capacidad diaria.
    const personasOcupadas = await this.reservaRepo.countPersonasByDestinoAndFecha(
      data.destinoId,
      data.fechaViaje
    );
    const totalPersonas = personasOcupadas + data.numPersonas;
    if (totalPersonas > destino.capacidadDiaria) {
      const disponibles = destino.capacidadDiaria - personasOcupadas;
      throw new BusinessError(
        'Cupo insuficiente',
        `Solo hay ${disponibles} cupo(s) disponibles para esa fecha.`,
        409
      );
    }

    //! RN-03: Calcular la tarifa usando el servicio de cotización.
    const _cotizacion = this.cotizacionService.calcular({
      precioBase: destino.precioBase,
      numPersonas: data.numPersonas,
    });

    //! RN-04: Gateway simulado por paridad del último dígito de la tarjeta.
    const ultimoDigito = parseInt(
      data.ultimosDigitosTarjeta[data.ultimosDigitosTarjeta.length - 1],
      10
    );
    if (isNaN(ultimoDigito)) {
      throw new BusinessError('Datos de pago inválidos', 'Los dígitos de la tarjeta deben ser numéricos.', 400);
    }

    const esPar = ultimoDigito % 2 === 0;

    //! RF-03 / RN-04: Par genera CONFIRMADA, impar genera RECHAZADA sin abortar ni bloquear guardado
    const codigoConfirmacion = this.generarCodigoConfirmacion();
    const estadoReserva: EstadoReserva = esPar ? 'CONFIRMADA' : 'RECHAZADA';

    try {
      const reservaCreada = await this.reservaRepo.create({
        ...data,
        estado: estadoReserva,
        codigoConfirmacion,
      });
      if (!reservaCreada.destinoNombre) reservaCreada.destinoNombre = destino.nombre;
      if (!reservaCreada.nombreDestino) reservaCreada.nombreDestino = destino.nombre;
      return reservaCreada;
    } catch (err: any) {
      if (err.message && err.message.includes('Cupo insuficiente')) {
        throw new BusinessError('Cupo insuficiente', err.message, 409);
      }
      throw err;
    }
  }

  //* Obtiene una reserva por ID resolviendo el nombre del destino (SOLID).
  async obtenerReserva(id: string): Promise<Reserva> {
    const reserva = await this.reservaRepo.findById(id);
    if (!reserva) {
      throw new BusinessError('Reserva no encontrada', `No existe una reserva con ID ${id}.`, 404);
    }
    if (!reserva.destinoNombre || !reserva.nombreDestino) {
      const destino = await this.destinoRepo.findById(reserva.destinoId);
      if (destino) {
        reserva.destinoNombre = reserva.destinoNombre || destino.nombre;
        reserva.nombreDestino = reserva.nombreDestino || destino.nombre;
      }
    }
    return reserva;
  }

  //* RF-04: Obtiene una reserva por su código de confirmación y valida opcionalmente el correo coincidente.
  async obtenerPorCodigo(codigo: string, correo?: string): Promise<Reserva> {
    if (!this.reservaRepo.findByCodigo) {
      throw new BusinessError('Operación no soportada', 'El repositorio no soporta búsqueda por código.', 500);
    }
    const reserva = await this.reservaRepo.findByCodigo(codigo);
    if (!reserva) {
      throw new BusinessError('Reserva no encontrada', `No existe una reserva con el código ${codigo}.`, 404);
    }
    if (correo && reserva.clienteEmail.toLowerCase() !== correo.trim().toLowerCase()) {
      throw new BusinessError('Acceso denegado', 'El correo no coincide con la reserva.', 403);
    }
    if (!reserva.destinoNombre || !reserva.nombreDestino) {
      const destino = await this.destinoRepo.findById(reserva.destinoId);
      if (destino) {
        reserva.destinoNombre = reserva.destinoNombre || destino.nombre;
        reserva.nombreDestino = reserva.nombreDestino || destino.nombre;
      }
    }
    return reserva;
  }

  // RF-08: Cambia el estado de una reserva desde la administración (CONFIRMADA / CANCELADA)
  async cambiarEstadoAdmin(id: string, nuevoEstado: EstadoReserva): Promise<Reserva> {
    await this.obtenerReserva(id);
    return this.reservaRepo.updateEstado(id, nuevoEstado);
  }

  // RF-08: Elimina una reserva de la base de datos
  async eliminarReservaAdmin(id: string): Promise<boolean> {
    await this.obtenerReserva(id);
    if (!this.reservaRepo.delete) {
      throw new BusinessError('Operación no soportada', 'El repositorio no soporta eliminación.', 500);
    }
    return this.reservaRepo.delete(id);
  }

  // RF-09: Actualiza el estado del pago simulado y sincroniza la reserva
  async actualizarPagoAdmin(id: string, estadoPago: string): Promise<Reserva> {
    await this.obtenerReserva(id);
    if (!this.reservaRepo.updateEstadoPago) {
      throw new BusinessError('Operación no soportada', 'El repositorio no soporta actualización de pago.', 500);
    }
    return this.reservaRepo.updateEstadoPago(id, estadoPago);
  }

  //* Obtiene las reservas asociadas al correo de un cliente con el nombre del destino (SOLID).
  async obtenerPorCorreo(correo: string): Promise<Reserva[]> {
    if (!this.reservaRepo.findByCorreo) {
      throw new BusinessError('Operación no soportada', 'El repositorio no soporta búsqueda por correo.', 500);
    }
    const reservas = await this.reservaRepo.findByCorreo(correo);
    for (const r of reservas) {
      if (!r.destinoNombre || !r.nombreDestino) {
        const destino = await this.destinoRepo.findById(r.destinoId);
        if (destino) {
          r.destinoNombre = r.destinoNombre || destino.nombre;
          r.nombreDestino = r.nombreDestino || destino.nombre;
        }
      }
    }
    return reservas;
  }

  //* CAR-06: Lista todas las reservas registradas para monitoreo y auditoría administrativa.
  async listarTodas(): Promise<ReservaAuditoria[]> {
    if (!this.reservaRepo.findAll) {
      throw new BusinessError('Operación no soportada', 'El repositorio no soporta listar todas las reservas.', 500);
    }
    const reservas = await this.reservaRepo.findAll();
    return reservas.map((r) => ({
      ...r,
      nombreDestino: r.nombreDestino || r.destinoNombre,
    }));
  }

  //! RN-02: Cancelación solo permitida si faltan ESTRICTAMENTE MÁS de 48 horas para el viaje.
  async cancelarReserva(id: string): Promise<Reserva> {
    const reserva = await this.obtenerReserva(id);

    if (reserva.estado === 'CANCELADA') {
      throw new BusinessError('Estado inválido', 'La reserva ya está cancelada.', 400);
    }

    this.validarVentana48h(reserva.fechaViaje, 'cancelar');

    return this.reservaRepo.updateEstado(id, 'CANCELADA');
  }

  //! RN-02: Reprogramación solo permitida si faltan ESTRICTAMENTE MÁS de 48 horas para el viaje.
  async reprogramarReserva(id: string, nuevaFecha: string): Promise<Reserva> {
    const reserva = await this.obtenerReserva(id);

    if (reserva.estado === 'CANCELADA') {
      throw new BusinessError('Estado inválido', 'No se puede reprogramar una reserva cancelada.', 400);
    }

    this.validarVentana48h(reserva.fechaViaje, 'reprogramar');

    //! RN-01: Verificar cupos en la nueva fecha antes de reprogramar.
    const destino = await this.destinoRepo.findById(reserva.destinoId);
    if (!destino) throw new BusinessError('Destino no disponible', 'El destino de la reserva ya no existe.', 404);

    const personasOcupadas = await this.reservaRepo.countPersonasByDestinoAndFecha(
      reserva.destinoId,
      nuevaFecha
    );
    if (personasOcupadas + reserva.numPersonas > destino.capacidadDiaria) {
      const disponibles = destino.capacidadDiaria - personasOcupadas;
      throw new BusinessError(
        'Cupo insuficiente',
        `Solo hay ${disponibles} cupo(s) disponibles para la nueva fecha.`,
        409
      );
    }

    return this.reservaRepo.updateFecha(id, nuevaFecha);
  }

  // Consulta cupos disponibles para un destino y fecha especifica (RN-01)
  async consultarCuposDisponibles(
    destinoId: string,
    fechaViaje: string
  ): Promise<{ capacidadTotal: number; ocupados: number; disponibles: number }> {
    const destino = await this.destinoRepo.findById(destinoId);
    if (!destino) {
      throw new BusinessError('Destino no disponible', 'El destino no existe.', 404);
    }

    const ocupados = await this.reservaRepo.countPersonasByDestinoAndFecha(
      destinoId,
      fechaViaje
    );
    const disponibles = Math.max(0, destino.capacidadDiaria - ocupados);

    return {
      capacidadTotal: destino.capacidadDiaria,
      ocupados,
      disponibles,
    };
  }

  // Helpers privados 

  //! RN-02: Calcula la diferencia en horas entre ahora (UTC) y la fecha del viaje.
  private validarVentana48h(fechaViaje: string, accion: string): void {
    const ahora = new Date(); // hora UTC del servidor
    const viaje = new Date(`${fechaViaje}T00:00:00Z`);
    const diferenciaMs = viaje.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

    if (diferenciaHoras <= 48) {
      throw new BusinessError(
        'Ventana temporal vencida',
        `No se puede ${accion} la reserva con menos de 48 horas de anticipación.`,
        400
      );
    }
  }

  //* Genera un código de confirmación con formato 'VY-XXXX-XX'.
  private generarCodigoConfirmacion(): string {
    const parte1 = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
    const parte2 = Math.floor(10 + Math.random() * 90);     // 2 dígitos
    return `VY-${parte1}-${parte2}`;
  }
}
