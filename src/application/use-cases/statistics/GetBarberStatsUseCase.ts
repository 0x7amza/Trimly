import { IBookingRepository } from '@domain/repositories/IBookingRepository';

export class GetBarberStatsUseCase {
  constructor(private bookingRepo: IBookingRepository) {}

  async execute(barberId: string) {
    const bookings = await this.bookingRepo.findAllByBarberId(barberId);

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;

    const totalRevenuePence = bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.amountPence || 0), 0);

    return {
      totalBookings,
      completedBookings,
      upcomingBookings,
      cancelledBookings,
      totalRevenuePence,
    };
  }
}
