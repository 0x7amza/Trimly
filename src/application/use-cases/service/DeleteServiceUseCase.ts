import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { ForbiddenError, NotFoundError } from '@shared/errors/AppError';

export class DeleteServiceUseCase {
  constructor(private serviceRepo: IServiceRepository) {}

  async execute(serviceId: string, barberId: string): Promise<void> {
    const existing = await this.serviceRepo.findById(serviceId);
    if (!existing) throw new NotFoundError('Service');

    if (existing.barberId !== barberId) {
      throw new ForbiddenError('You can only delete your own services');
    }

    await this.serviceRepo.delete(serviceId);
  }
}
