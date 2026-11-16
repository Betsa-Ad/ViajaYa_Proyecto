import { PoolClient } from 'pg';
import type { IReservaRepository, Reserva, EstadoReserva, CreateReservaDto, ReservaAuditoria } from '../webnegocio/src/interfaces/IReservaRepository';
export declare class ReservaRepository implements IReservaRepository {
    private readonly selectReservaBase;
    findById(id: string): Promise<Reserva | null>;
    countPersonasByDestinoAndFecha(destinoId: string, fecha: string): Promise<number>;
    insertarPago(idReserva: number, referencia: string, ultimoDigito: string, estadoPago?: string, client?: PoolClient): Promise<void>;
    create(data: CreateReservaDto & {
        estado: EstadoReserva;
        codigoConfirmacion: string | null;
    }): Promise<Reserva>;
    updateEstado(id: string, estado: EstadoReserva): Promise<Reserva>;
    updateFecha(id: string, nuevaFecha: string): Promise<Reserva>;
    findByCodigo(codigo: string): Promise<Reserva | null>;
    findByCorreo(correo: string): Promise<Reserva[]>;
    findAll(): Promise<ReservaAuditoria[]>;
    delete(id: string): Promise<boolean>;
    updateEstadoPago(idReserva: string, estadoPago: string): Promise<Reserva>;
}
