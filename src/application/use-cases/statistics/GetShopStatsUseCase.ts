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
    const allBookingsPromises = barberIds.map(id => this.bookingRepo.findAllByBarberId(id));
    const allBookingsArrays = await Promise.all(allBookingsPromises);
    const allBookings = allBookingsArrays.flat();

    const totalBookings = allBookings.length;
    const completedBookings = allBookings.filter(b => b.status === 'COMPLETED').length;
    const upcomingBookings = allBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
    const cancelledBookings = allBookings.filter(b => b.status === 'CANCELLED').length;

    const totalRevenuePence = allBookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.amountPence || 0), 0);

    const revenueByBarber = barbers.map(barber => {
      const barberBookings = allBookings.filter(b => b.barberId === barber.clerkId && b.status === 'COMPLETED');
      const revenue = barberBookings.reduce((sum, b) => sum + (b.amountPence || 0), 0);
      return {
        barberId: barber.clerkId,
        name: barber.name,
        revenuePence: revenue
      };
    });

    return {
      totalBookings,
      completedBookings,
      upcomingBookings,
      cancelledBookings,
      totalRevenuePence,
      revenueByBarber,
      totalBarbers: barbers.length,
    };
  }
}
