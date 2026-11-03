"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinoService = void 0;
const reserva_service_1 = require("./reserva.service");
class DestinoService {
    constructor(repo) {
        this.repo = repo;
    }
    //* Retorna todos los destinos activos del catálogo.
    async listarActivos() {
        return this.repo.findAll();
    }
    //* Crea un nuevo destino; valida que precio y capacidad sean positivos.
    async crear(data) {
        //! RN: El precio base y la capacidad diaria deben ser mayores a cero.
        if (data.precioBase <= 0) {
            throw new reserva_service_1.BusinessError('Precio inválido', 'El precio base debe ser mayor a cero.', 400);
        }
        if (data.capacidadDiaria <= 0) {
            throw new reserva_service_1.BusinessError('Capacidad inválida', 'La capacidad diaria debe ser mayor a cero.', 400);
        }
        return this.repo.create(data);
    }
    //* Edita los campos enviados de un destino existente; verifica que exista primero.
    async editar(id, data) {
        const existente = await this.repo.findById(id);
        //! RN: No se puede editar un destino que no existe.
        if (!existente) {
            throw new reserva_service_1.BusinessError('Destino no encontrado', 'Destino no encontrado.', 404);
        }
        if (data.precioBase !== undefined && data.precioBase <= 0) {
            throw new reserva_service_1.BusinessError('Precio inválido', 'El precio base debe ser mayor a cero.', 400);
        }
        if (data.capacidadDiaria !== undefined && data.capacidadDiaria <= 0) {
            throw new reserva_service_1.BusinessError('Capacidad inválida', 'La capacidad diaria debe ser mayor a cero.', 400);
        }
        return this.repo.update(id, data);
    }
    //! RN: Desactivación lógica — el registro permanece en BD con activo=false.
    async desactivar(id) {
        const existente = await this.repo.findById(id);
        if (!existente) {
            throw new reserva_service_1.BusinessError('Destino no encontrado', 'Destino no encontrado.', 404);
        }
        if (!existente.activo) {
            throw new reserva_service_1.BusinessError('Destino ya desactivado', 'El destino ya se encuentra desactivado.', 400);
        }
        return this.repo.deactivate(id);
    }
}
exports.DestinoService = DestinoService;
//# sourceMappingURL=destino.service.js.map