import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { NotFoundError, ValidationError } from '@shared/errors/AppError';
import { fromZonedTime } from 'date-fns-tz';

interface TimeSlot {
  startTime: string;  // ISO 8601
  endTime: string;    // ISO 8601
}

/**
 * Calculate Availability Use Case — the core scheduling algorithm.
 *
 * Steps:
 * 1. Fetch barber's business hours for the requested date
 * 2. Fetch the service duration
 * 3. Fetch all existing non-cancelled bookings for that date
 * 4. Generate all possible time slots at 15-minute intervals
 * 5. Filter out slots that overlap with existing bookings
 * 6. Return available { startTime, endTime } slots
 */
export class CalculateAvailabilityUseCase {
  private static readonly SLOT_INTERVAL_MINUTES = 15;

  constructor(
    private bookingRepo: IBookingRepository,
    private barberRepo: IBarberRepository,
    private serviceRepo: IServiceRepository,
  ) {}

  async execute(data: {
    barberId: string;
    serviceId: string;
    date: string;  // "YYYY-MM-DD"
  }): Promise<TimeSlot[]> {
    // 1. Validate barber exists
    const barber = await this.barberRepo.findByClerkId(data.barberId);
    if (!barber) throw new NotFoundError('Barber');

    // 2. Validate service exists and get duration
    const service = await this.serviceRepo.findById(data.serviceId);
    if (!service) throw new NotFoundError('Service');
    if (service.barberId !== data.barberId) {
      throw new ValidationError('Service does not belong to this barber');
    }

    const durationMinutes = service.durationMinutes;

    // 3. Get business hours for the requested day
    const requestedDate = new Date(data.date);
    const dayOfWeek = requestedDate.getDay(); // 0 = Sunday
    const dayHours = barber.businessHours.find((bh) => bh.day === dayOfWeek);

    if (!dayHours || dayHours.isClosed) {
      return []; // Shop is closed on this day
    }

    const timezone = barber.timezone || 'UTC';
    
    // 4. Calculate the start/end of the business day in full datetime
    const dayStart = this.buildDateTime(data.date, dayHours.open, timezone);
    const dayEnd = this.buildDateTime(data.date, dayHours.close, timezone);

    // 5. Fetch existing bookings for the day
    const existingBookings = await this.bookingRepo.findByBarberAndDateRange(
      data.barberId,
      dayStart,
      dayEnd,
    );

    // 6. Generate all possible slots and filter out conflicts
    const availableSlots: TimeSlot[] = [];
    let currentSlotStart = new Date(dayStart);

    while (currentSlotStart.getTime() + durationMinutes * 60 * 1000 <= dayEnd.getTime()) {
      const currentSlotEnd = new Date(
        currentSlotStart.getTime() + durationMinutes * 60 * 1000,
      );

      // Check if this slot overlaps with any existing booking
      const hasConflict = existingBookings.some((booking) => {
        return (
          currentSlotStart < new Date(booking.endTime) &&
          currentSlotEnd > new Date(booking.startTime)
        );
      });

      // Don't show past slots for today
      const now = new Date();
      const isPast = currentSlotStart < now;

      if (!hasConflict && !isPast) {
        availableSlots.push({
          startTime: currentSlotStart.toISOString(),
          endTime: currentSlotEnd.toISOString(),
        });
      }

      // Move to next slot interval
      currentSlotStart = new Date(
        currentSlotStart.getTime() +
          CalculateAvailabilityUseCase.SLOT_INTERVAL_MINUTES * 60 * 1000,
      );
    }

    return availableSlots;
  }

  /**
   * Build a full Date from "YYYY-MM-DD" and "HH:mm".
   */
  private buildDateTime(dateStr: string, timeStr: string, timeZone: string): Date {
    const localDateTimeStr = `${dateStr}T${timeStr}:00`;
    return fromZonedTime(localDateTimeStr, timeZone);
  }
}
