// ============================================================
// services/destino.service.ts
// Lógica de negocio para la gestión del catálogo de destinos.
// ============================================================

import {
  IDestinoRepository,
  CreateDestinoDto,
  UpdateDestinoDto,
  Destino,
} from '../interfaces/IDestinoRepository';

export class DestinoService {
  constructor(private readonly repo: IDestinoRepository) {}

  //* Retorna todos los destinos activos del catálogo.
  async listarActivos(): Promise<Destino[]> {
    return this.repo.findAll();
  }

  //* Crea un nuevo destino; valida que precio y capacidad sean positivos.
  async crear(data: CreateDestinoDto): Promise<Destino> {
    //! RN: El precio base y la capacidad diaria deben ser mayores a cero.
    if (data.precioBase <= 0) {
      throw new Error('El precio base debe ser mayor a cero.');
    }
    if (data.capacidadDiaria <= 0) {
      throw new Error('La capacidad diaria debe ser mayor a cero.');
    }
    return this.repo.create(data);
  }

  //* Edita los campos enviados de un destino existente; verifica que exista primero.
  async editar(id: string, data: UpdateDestinoDto): Promise<Destino> {
    const existente = await this.repo.findById(id);
    //! RN: No se puede editar un destino que no existe.
    if (!existente) {
      throw new Error('Destino no encontrado.');
    }
    if (data.precioBase !== undefined && data.precioBase <= 0) {
      throw new Error('El precio base debe ser mayor a cero.');
    }
    if (data.capacidadDiaria !== undefined && data.capacidadDiaria <= 0) {
      throw new Error('La capacidad diaria debe ser mayor a cero.');
    }
    return this.repo.update(id, data);
  }

  //! RN: Desactivación lógica — el registro permanece en BD con activo=false.
  async desactivar(id: string): Promise<Destino> {
    const existente = await this.repo.findById(id);
    if (!existente) {
      throw new Error('Destino no encontrado.');
    }
    if (!existente.activo) {
      throw new Error('El destino ya se encuentra desactivado.');
    }
    return this.repo.deactivate(id);
  }
}
