import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IBooking, BookingStatus } from '@domain/entities/Booking';
import { ForbiddenError, NotFoundError, ValidationError } from '@shared/errors/AppError';

/**
 * Valid status transitions:
 * PENDING   → CONFIRMED, CANCELLED
 * CONFIRMED → COMPLETED, CANCELLED
 * COMPLETED → (terminal)
 * CANCELLED → (terminal)
 */
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export class UpdateBookingStatusUseCase {
  constructor(private bookingRepo: IBookingRepository) {}

  async execute(data: {
    bookingId: string;
    barberId: string;
    newStatus: BookingStatus;
  }): Promise<IBooking> {
    const booking = await this.bookingRepo.findById(data.bookingId);
    if (!booking) throw new NotFoundError('Booking');

    // Ownership check
    if (booking.barberId !== data.barberId) {
      throw new ForbiddenError('You can only update your own bookings');
    }

    // Validate status transition
    const allowed = VALID_TRANSITIONS[booking.status];
    if (!allowed.includes(data.newStatus)) {
      throw new ValidationError(
        `Cannot transition from ${booking.status} to ${data.newStatus}`,
      );
    }

    const updated = await this.bookingRepo.update(data.bookingId, {
      status: data.newStatus,
    });

    if (!updated) throw new NotFoundError('Booking');
    return updated;
  }
}
