import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { IService } from '@domain/entities/Service';
import { ForbiddenError, NotFoundError } from '@shared/errors/AppError';

export class UpdateServiceUseCase {
  constructor(private serviceRepo: IServiceRepository) {}

  async execute(
    serviceId: string,
    barberId: string,
    data: { name?: string; price?: number; durationMinutes?: number },
  ): Promise<IService> {
    const existing = await this.serviceRepo.findById(serviceId);
    if (!existing) throw new NotFoundError('Service');

    // Ownership check — barber can only update their own services
    if (existing.barberId !== barberId) {
      throw new ForbiddenError('You can only update your own services');
    }

    const updated = await this.serviceRepo.update(serviceId, data);
    if (!updated) throw new NotFoundError('Service');
    return updated;
  }
}
