"use strict";
// Implementación en memoria de IDestinoRepository e IReservaRepository.
//! SOLO para desarrollo y pruebas locales 
// Cuando webdatos esté listo, se inyectan las implementaciones reales.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockReservaRepository = exports.MockDestinoRepository = void 0;
const uuid_1 = require("uuid");
// MOCK DESTINOS 
//* Repositorio en memoria para Destinos — simula la BD sin necesitar webdatos.
class MockDestinoRepository {
    constructor() {
        this.destinos = [
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
    }
    //* Retorna todos los destinos marcados como activos.
    async findAll() {
        return this.destinos.filter((d) => d.activo);
    }
    //* Busca un destino por su ID (activo o no).
    async findById(id) {
        return this.destinos.find((d) => d.id === id) ?? null;
    }
    //* Inserta un nuevo destino en el arreglo en memoria.
    async create(data) {
        const nuevo = {
            id: (0, uuid_1.v4)(),
            ...data,
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.destinos.push(nuevo);
        return nuevo;
    }
    //* Actualiza los campos enviados de un destino existente.
    async update(id, data) {
        const index = this.destinos.findIndex((d) => d.id === id);
        if (index === -1)
            throw new Error('Destino no encontrado');
        this.destinos[index] = { ...this.destinos[index], ...data, updatedAt: new Date() };
        return this.destinos[index];
    }
    //! RN: Desactivación lógica — nunca se borra el registro de la BD.
    async deactivate(id) {
        const index = this.destinos.findIndex((d) => d.id === id);
        if (index === -1)
            throw new Error('Destino no encontrado');
        this.destinos[index].activo = false;
        this.destinos[index].updatedAt = new Date();
        return this.destinos[index];
    }
}
exports.MockDestinoRepository = MockDestinoRepository;
//MOCK RESERVAS 
//* Repositorio en memoria para Reservas — simula la BD sin necesitar webdatos.
class MockReservaRepository {
    constructor() {
        this.reservas = [];
    }
    //* Busca una reserva por su ID.
    async findById(id) {
        return this.reservas.find((r) => r.id === id) ?? null;
    }
    //! RN-01: Suma las personas con reserva CONFIRMADA para ese destino y fecha (para validar cupo).
    async countPersonasByDestinoAndFecha(destinoId, fecha) {
        return this.reservas
            .filter((r) => r.destinoId === destinoId &&
            r.fechaViaje === fecha &&
            r.estado === 'CONFIRMADA')
            .reduce((sum, r) => sum + r.numPersonas, 0);
    }
    //* Inserta una nueva reserva con estado y código ya calculados por el servicio.
    async create(data) {
        const nombreDestino = data.destinoNombre ||
            data.nombreDestino ||
            (data.destinoId === 'dest-001'
                ? 'Playa Tamarindo'
                : data.destinoId === 'dest-002'
                    ? 'Volcán Arenal'
                    : 'Destino turístico');
        const nueva = {
            id: (0, uuid_1.v4)(),
            destinoId: data.destinoId,
            destinoNombre: nombreDestino,
            nombreDestino: nombreDestino,
            clienteNombre: data.clienteNombre,
            clienteEmail: data.clienteEmail,
            fechaViaje: data.fechaViaje,
            numPersonas: data.numPersonas,
            estado: data.estado,
            codigoConfirmacion: data.codigoConfirmacion,
            estadoPago: data.estado === 'CONFIRMADA' ? 'APROBADO' : 'RECHAZADO',
            createdAt: new Date(),
        };
        this.reservas.push(nueva);
        return nueva;
    }
    //* Actualiza solo el estado de una reserva (ej. CANCELADA).
    async updateEstado(id, estado) {
        const index = this.reservas.findIndex((r) => r.id === id);
        if (index === -1)
            throw new Error('Reserva no encontrada');
        this.reservas[index].estado = estado;
        return this.reservas[index];
    }
    //* Actualiza solo la fecha de viaje de una reserva (reprogramación).
    async updateFecha(id, nuevaFecha) {
        const index = this.reservas.findIndex((r) => r.id === id);
        if (index === -1)
            throw new Error('Reserva no encontrada');
        this.reservas[index].fechaViaje = nuevaFecha;
        return this.reservas[index];
    }
    //* RF-08: Elimina una reserva de la memoria.
    async delete(id) {
        const index = this.reservas.findIndex((r) => r.id === id);
        if (index === -1)
            return false;
        this.reservas.splice(index, 1);
        return true;
    }
    //* RF-09: Actualiza el estado del pago simulado y sincroniza el estado de la reserva.
    async updateEstadoPago(idReserva, estadoPago) {
        const index = this.reservas.findIndex((r) => r.id === idReserva);
        if (index === -1)
            throw new Error('Reserva no encontrada');
        this.reservas[index].estadoPago = estadoPago;
        if (estadoPago === 'APROBADO')
            this.reservas[index].estado = 'CONFIRMADA';
        if (estadoPago === 'RECHAZADO')
            this.reservas[index].estado = 'RECHAZADA';
        if (estadoPago === 'PENDIENTE')
            this.reservas[index].estado = 'PENDIENTE';
        return this.reservas[index];
    }
    //* Consulta una reserva por su código de confirmación.
    async findByCodigo(codigo) {
        return this.reservas.find((r) => r.codigoConfirmacion === codigo) ?? null;
    }
    //* Consulta reservas por el correo del cliente.
    async findByCorreo(correo) {
        return this.reservas.filter((r) => r.clienteEmail.toLowerCase() === correo.toLowerCase());
    }
    //* Consulta todas las reservas (para monitoreo y pruebas de auditoría).
    async findAll() {
        return this.reservas;
    }
}
exports.MockReservaRepository = MockReservaRepository;
//# sourceMappingURL=mock.repository.js.map