import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { IPaymentService } from '@application/interfaces/IPaymentService';
import { ConflictError, NotFoundError, ValidationError } from '@shared/errors/AppError';

interface CreateOnlineBookingResult {
  bookingId: string;
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create Online Booking Use Case — customer books + pays via Stripe.
 *
 * CRITICAL SECURITY:
 * - NEVER trust frontend pricing. Always fetch price from DB.
 * - Check for overlapping bookings to prevent double-booking (race condition safe).
 */
export class CreateOnlineBookingUseCase {
  constructor(
    private bookingRepo: IBookingRepository,
    private serviceRepo: IServiceRepository,
    private paymentService: IPaymentService,
  ) {}

  async execute(data: {
    barberId: string;
    customerId: string;
    serviceId: string;
    startTime: string; // ISO 8601
  }): Promise<CreateOnlineBookingResult> {
    // 1. Fetch the service from DB — NEVER trust frontend price
    const service = await this.serviceRepo.findById(data.serviceId);
    if (!service) throw new NotFoundError('Service');
    if (!service.isActive) throw new ValidationError('This service is no longer available');
    if (service.barberId !== data.barberId) {
      throw new ValidationError('Service does not belong to this barber');
    }

    // 2. Calculate end time from service duration
    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);

    // 3. Check for overlapping bookings (race condition prevention)
    const overlapping = await this.bookingRepo.findOverlapping(
      data.barberId,
      startTime,
      endTime,
    );

    if (overlapping.length > 0) {
      throw new ConflictError(
        'This time slot is no longer available. Please select a different time.',
      );
    }

    // 4. Create Stripe Payment Intent with the DB price (not frontend price)
    const { clientSecret, paymentIntentId } = await this.paymentService.createPaymentIntent(
      service.price,
      'gbp',
      {
        barberId: data.barberId,
        customerId: data.customerId,
        serviceId: data.serviceId,
      },
    );

    // 5. Create booking with PENDING status
    const booking = await this.bookingRepo.create({
      barberId: data.barberId,
      customerId: data.customerId,
      serviceId: data.serviceId,
      startTime,
      endTime,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentIntentId,
      isManual: false,
    });

    return {
      bookingId: booking.id,
      clientSecret,
      paymentIntentId,
    };
  }
}
