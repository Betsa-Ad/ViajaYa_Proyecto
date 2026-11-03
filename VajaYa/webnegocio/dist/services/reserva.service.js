"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaService = exports.BusinessError = void 0;
const cotizacion_service_1 = require("./cotizacion.service");
// Errores de negocio tipados 
class BusinessError extends Error {
    constructor(title, message, statusCode = 400) {
        super(message);
        this.title = title;
        this.statusCode = statusCode;
        this.name = 'BusinessError';
    }
}
exports.BusinessError = BusinessError;
// Servicio 
class ReservaService {
    constructor(reservaRepo, destinoRepo) {
        this.reservaRepo = reservaRepo;
        this.destinoRepo = destinoRepo;
        this.cotizacionService = new cotizacion_service_1.CotizacionService();
    }
    //* Crea una reserva aplicando RN-01 (cupos), RN-03 (tarifa) y RN-04 (pago simulado).
    async crearReserva(data) {
        // Verificar que el destino existe y está activo
        const destino = await this.destinoRepo.findById(data.destinoId);
        if (!destino || !destino.activo) {
            throw new BusinessError('Destino no disponible', 'El destino no existe o está desactivado.', 404);
        }
        //! RN-01: Validar que las personas ya reservadas + nuevas no excedan la capacidad diaria.
        const personasOcupadas = await this.reservaRepo.countPersonasByDestinoAndFecha(data.destinoId, data.fechaViaje);
        const totalPersonas = personasOcupadas + data.numPersonas;
        if (totalPersonas > destino.capacidadDiaria) {
            const disponibles = destino.capacidadDiaria - personasOcupadas;
            throw new BusinessError('Cupo insuficiente', `Solo hay ${disponibles} cupo(s) disponibles para esa fecha.`, 409);
        }
        //! RN-03: Calcular la tarifa usando el servicio de cotización.
        const _cotizacion = this.cotizacionService.calcular({
            precioBase: destino.precioBase,
            numPersonas: data.numPersonas,
        });
        //! RN-04: Gateway simulado por paridad del último dígito de la tarjeta.
        const ultimoDigito = parseInt(data.ultimosDigitosTarjeta[data.ultimosDigitosTarjeta.length - 1], 10);
        if (isNaN(ultimoDigito)) {
            throw new BusinessError('Datos de pago inválidos', 'Los dígitos de la tarjeta deben ser numéricos.', 400);
        }
        const esPar = ultimoDigito % 2 === 0;
        //! RN-04: Dígito IMPAR → pago rechazado, se devuelve HTTP 422.
        if (!esPar) {
            throw new BusinessError('Pago rechazado', 'La transacción fue rechazada por el gateway de pago. Verifique los datos de su tarjeta.', 422);
        }
        //! RN-04: Dígito PAR → pago aprobado, genera código único 'VY-XXXX-XX'.
        const codigoConfirmacion = this.generarCodigoConfirmacion();
        try {
            return await this.reservaRepo.create({
                ...data,
                estado: 'CONFIRMADA',
                codigoConfirmacion,
            });
        }
        catch (err) {
            if (err.message && err.message.includes('Cupo insuficiente')) {
                throw new BusinessError('Cupo insuficiente', err.message, 409);
            }
            throw err;
        }
    }
    //* Obtiene una reserva por ID; lanza 404 si no existe.
    async obtenerReserva(id) {
        const reserva = await this.reservaRepo.findById(id);
        if (!reserva) {
            throw new BusinessError('Reserva no encontrada', `No existe una reserva con ID ${id}.`, 404);
        }
        return reserva;
    }
    //* Obtiene una reserva por su código de confirmación.
    async obtenerPorCodigo(codigo) {
        if (!this.reservaRepo.findByCodigo) {
            throw new BusinessError('Operación no soportada', 'El repositorio no soporta búsqueda por código.', 500);
        }
        const reserva = await this.reservaRepo.findByCodigo(codigo);
        if (!reserva) {
            throw new BusinessError('Reserva no encontrada', `No existe una reserva con el código ${codigo}.`, 404);
        }
        return reserva;
    }
    //* Obtiene las reservas asociadas al correo de un cliente.
    async obtenerPorCorreo(correo) {
        if (!this.reservaRepo.findByCorreo) {
            throw new BusinessError('Operación no soportada', 'El repositorio no soporta búsqueda por correo.', 500);
        }
        return this.reservaRepo.findByCorreo(correo);
    }
    //* CAR-06: Lista todas las reservas registradas para monitoreo y auditoría administrativa.
    async listarTodas() {
        if (!this.reservaRepo.findAll) {
            throw new BusinessError('Operación no soportada', 'El repositorio no soporta listar todas las reservas.', 500);
        }
        return this.reservaRepo.findAll();
    }
    //! RN-02: Cancelación solo permitida si faltan ESTRICTAMENTE MÁS de 48 horas para el viaje.
    async cancelarReserva(id) {
        const reserva = await this.obtenerReserva(id);
        if (reserva.estado === 'CANCELADA') {
            throw new BusinessError('Estado inválido', 'La reserva ya está cancelada.', 400);
        }
        this.validarVentana48h(reserva.fechaViaje, 'cancelar');
        return this.reservaRepo.updateEstado(id, 'CANCELADA');
    }
    //! RN-02: Reprogramación solo permitida si faltan ESTRICTAMENTE MÁS de 48 horas para el viaje.
    async reprogramarReserva(id, nuevaFecha) {
        const reserva = await this.obtenerReserva(id);
        if (reserva.estado === 'CANCELADA') {
            throw new BusinessError('Estado inválido', 'No se puede reprogramar una reserva cancelada.', 400);
        }
        this.validarVentana48h(reserva.fechaViaje, 'reprogramar');
        //! RN-01: Verificar cupos en la nueva fecha antes de reprogramar.
        const destino = await this.destinoRepo.findById(reserva.destinoId);
        if (!destino)
            throw new BusinessError('Destino no disponible', 'El destino de la reserva ya no existe.', 404);
        const personasOcupadas = await this.reservaRepo.countPersonasByDestinoAndFecha(reserva.destinoId, nuevaFecha);
        if (personasOcupadas + reserva.numPersonas > destino.capacidadDiaria) {
            const disponibles = destino.capacidadDiaria - personasOcupadas;
            throw new BusinessError('Cupo insuficiente', `Solo hay ${disponibles} cupo(s) disponibles para la nueva fecha.`, 409);
        }
        return this.reservaRepo.updateFecha(id, nuevaFecha);
    }
    // Helpers privados 
    //! RN-02: Calcula la diferencia en horas entre ahora (UTC) y la fecha del viaje.
    validarVentana48h(fechaViaje, accion) {
        const ahora = new Date(); // hora UTC del servidor
        const viaje = new Date(`${fechaViaje}T00:00:00Z`);
        const diferenciaMs = viaje.getTime() - ahora.getTime();
        const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
        if (diferenciaHoras <= 48) {
            throw new BusinessError('Ventana temporal vencida', `No se puede ${accion} la reserva con menos de 48 horas de anticipación.`, 400);
        }
    }
    //* Genera un código de confirmación con formato 'VY-XXXX-XX'.
    generarCodigoConfirmacion() {
        const parte1 = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
        const parte2 = Math.floor(10 + Math.random() * 90); // 2 dígitos
        return `VY-${parte1}-${parte2}`;
    }
}
exports.ReservaService = ReservaService;
//# sourceMappingURL=reserva.service.js.map