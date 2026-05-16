import { IService } from '@domain/entities/Service';

/**
 * Service repository contract.
 */
export interface IServiceRepository {
  findById(id: string): Promise<IService | null>;
  findByBarberId(barberId: string): Promise<IService[]>;
  create(service: Partial<IService>): Promise<IService>;
  update(id: string, data: Partial<IService>): Promise<IService | null>;
  delete(id: string): Promise<boolean>;
}
