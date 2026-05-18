import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IBarberRepository } from '@domain/repositories/IBarberRepository';

export class GetShopStatsUseCase {
  constructor(
    private bookingRepo: IBookingRepository,
    private barberRepo: IBarberRepository,
  ) {}

  async execute(shopId: string) {
    const barbers = await this.barberRepo.findByShopId(shopId);
    const barberIds = barbers.map(b => b.clerkId);

    // Fetch all bookings for all barbers in the shop
    // Since MongoBookingRepository doesn't have findByBarberIds, we can fetch for each and flatten
    // In a real app, we'd add findByBarberIds to the repo.
    const allBookingsPromises = barberIds.map(id => this.bookingRepo.findByBarberId(id));
    const allBookingsArrays = await Promise.all(allBookingsPromises);
    const allBookings = allBookingsArrays.flat();

    const totalBookings = allBookings.length;
    const completedBookings = allBookings.filter(b => b.status === 'COMPLETED').length;
    const upcomingBookings = allBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
    const cancelledBookings = allBookings.filter(b => b.status === 'CANCELLED').length;

    return {
      totalBookings,
      completedBookings,
      upcomingBookings,
      cancelledBookings,
      totalBarbers: barbers.length,
    };
  }
}
