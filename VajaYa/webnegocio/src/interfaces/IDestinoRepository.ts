// ============================================================
// interfaces/IDestinoRepository.ts
// Contrato que webdatos debe implementar para destinos.
// webnegocio solo conoce esta interfaz, nunca la implementación real.
// ============================================================

export interface Destino {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  capacidadDiaria: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDestinoDto {
  nombre: string;
  descripcion: string;
  precioBase: number;
  capacidadDiaria: number;
}

export interface UpdateDestinoDto {
  nombre?: string;
  descripcion?: string;
  precioBase?: number;
  capacidadDiaria?: number;
}

//* Contrato (interfaz) que la capa webdatos debe implementar para gestionar destinos.
export interface IDestinoRepository {
  findAll(): Promise<Destino[]>;
  findById(id: string): Promise<Destino | null>;
  create(data: CreateDestinoDto): Promise<Destino>;
  update(id: string, data: UpdateDestinoDto): Promise<Destino>;
  deactivate(id: string): Promise<Destino>;
}
