import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IBarber, IBusinessHours } from '@domain/entities/Barber';
import { NotFoundError } from '@shared/errors/AppError';

/**
 * Update Barber Profile Use Case — update business hours, shop details, etc.
 */
export class UpdateBarberProfileUseCase {
  constructor(private barberRepo: IBarberRepository) {}

  async execute(
    clerkId: string,
    data: {
      shopName?: string;
      phone?: string;
      address?: string;
      bio?: string;
      businessHours?: IBusinessHours[];
    },
  ): Promise<IBarber> {
    const updated = await this.barberRepo.update(clerkId, data);
    if (!updated) {
      throw new NotFoundError('Barber');
    }
    return updated;
  }
}
