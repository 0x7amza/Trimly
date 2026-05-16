import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { IBooking } from '@domain/entities/Booking';
import { ConflictError, NotFoundError } from '@shared/errors/AppError';

/**
 * Create Manual Booking Use Case — barber adds a walk-in or WhatsApp booking.
 *
 * Key differences from online booking:
 * - No Stripe payment
 * - Status is immediately CONFIRMED
 * - Customer info is optional (walk-in)
 */
export class CreateManualBookingUseCase {
  constructor(
    private bookingRepo: IBookingRepository,
    private serviceRepo: IServiceRepository,
  ) {}

  async execute(data: {
    barberId: string;
    serviceId: string;
    startTime: string;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }): Promise<IBooking> {
    // 1. Validate service
    const service = await this.serviceRepo.findById(data.serviceId);
    if (!service) throw new NotFoundError('Service');

    // 2. Calculate end time
    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);

    // 3. Check for overlap
    const overlapping = await this.bookingRepo.findOverlapping(
      data.barberId,
      startTime,
      endTime,
    );

    if (overlapping.length > 0) {
      throw new ConflictError('This time slot is already booked.');
    }

    // 4. Create booking — immediately confirmed, no payment required
    return this.bookingRepo.create({
      barberId: data.barberId,
      serviceId: data.serviceId,
      startTime,
      endTime,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      isManual: true,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      notes: data.notes,
    });
  }
}
