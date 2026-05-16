import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { IService } from '@domain/entities/Service';

export class GetBarberServicesUseCase {
  constructor(private serviceRepo: IServiceRepository) {}

  async execute(barberId: string): Promise<IService[]> {
    return this.serviceRepo.findByBarberId(barberId);
  }
}
