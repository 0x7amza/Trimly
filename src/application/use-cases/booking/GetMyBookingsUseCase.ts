import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IBooking } from '@domain/entities/Booking';

/**
 * Get My Bookings Use Case — returns upcoming bookings for a barber or customer.
 */
export class GetMyBookingsUseCase {
  constructor(private bookingRepo: IBookingRepository) {}

  async executeForBarber(barberId: string): Promise<IBooking[]> {
    return this.bookingRepo.findByBarberId(barberId);
  }

  async executeForCustomer(customerId: string): Promise<IBooking[]> {
    return this.bookingRepo.findByCustomerId(customerId);
  }
}
