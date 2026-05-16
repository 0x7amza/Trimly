import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IBarber } from '@domain/entities/Barber';
import { NotFoundError } from '@shared/errors/AppError';

/**
 * Get Barber Profile Use Case.
 */
export class GetBarberProfileUseCase {
  constructor(private barberRepo: IBarberRepository) {}

  async execute(clerkId: string): Promise<IBarber> {
    const barber = await this.barberRepo.findByClerkId(clerkId);
    if (!barber) {
      throw new NotFoundError('Barber');
    }
    return barber;
  }
}
