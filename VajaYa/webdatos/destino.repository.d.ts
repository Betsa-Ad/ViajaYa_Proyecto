import type { IDestinoRepository, Destino, CreateDestinoDto, UpdateDestinoDto } from '../webnegocio/src/interfaces/IDestinoRepository';
export declare class DestinoRepository implements IDestinoRepository {
    findAll(): Promise<Destino[]>;
    findById(id: string): Promise<Destino | null>;
    create(data: CreateDestinoDto): Promise<Destino>;
    update(id: string, data: UpdateDestinoDto): Promise<Destino>;
    deactivate(id: string): Promise<Destino>;
}
