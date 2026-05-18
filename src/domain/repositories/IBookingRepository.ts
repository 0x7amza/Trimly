import { IBooking } from '@domain/entities/Booking';

/**
 * Booking repository contract.
 * Includes domain-specific queries for availability calculations.
 */
export interface IBookingRepository {
  findById(id: string): Promise<IBooking | null>;

  /**
   * Find all non-cancelled bookings for a barber within a date range.
   * Used for availability calculation.
   */
  findByBarberAndDateRange(
    barberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<IBooking[]>;

  /**
   * Check if any booking overlaps with the given time window.
   * Critical for preventing double-bookings.
   */
  findOverlapping(
    barberId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<IBooking[]>;

  /**
   * Find bookings for a specific customer (upcoming).
   */
  findByCustomerId(customerId: string): Promise<IBooking[]>;

  /**
   * Find bookings for a specific barber (upcoming).
   */
  findByBarberId(barberId: string): Promise<IBooking[]>;

  /**
   * Find ALL bookings for a specific barber (historical and upcoming).
   */
  findAllByBarberId(barberId: string): Promise<IBooking[]>;

  findByPaymentIntentId(paymentIntentId: string): Promise<IBooking | null>;

  create(booking: Partial<IBooking>): Promise<IBooking>;
  update(id: string, data: Partial<IBooking>): Promise<IBooking | null>;
}
