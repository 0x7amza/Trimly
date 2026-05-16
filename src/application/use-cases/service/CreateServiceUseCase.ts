import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { IService } from '@domain/entities/Service';

export class CreateServiceUseCase {
  constructor(private serviceRepo: IServiceRepository) {}

  async execute(data: {
    barberId: string;
    name: string;
    price: number;
    durationMinutes: number;
  }): Promise<IService> {
    return this.serviceRepo.create({
      ...data,
      isActive: true,
    });
  }
}
