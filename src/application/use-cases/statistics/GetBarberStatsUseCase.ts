import { IBookingRepository } from '@domain/repositories/IBookingRepository';

export class GetBarberStatsUseCase {
  constructor(private bookingRepo: IBookingRepository) {}

  async execute(barberId: string) {
    const bookings = await this.bookingRepo.findByBarberId(barberId);

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;

    return {
      totalBookings,
      completedBookings,
      upcomingBookings,
      cancelledBookings,
    };
  }
}
