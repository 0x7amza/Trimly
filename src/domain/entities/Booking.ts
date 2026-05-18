/**
 * Booking status lifecycle: PENDING → CONFIRMED → COMPLETED
 *                                   ↘ CANCELLED
 */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type PaymentStatus = 'UNPAID' | 'DEPOSIT_PAID' | 'PAID_IN_FULL';

/**
 * Booking entity — the core of the platform.
 * Represents both online customer bookings and manual walk-in entries.
 */
export interface IBooking {
  id: string;
  barberId: string;          // clerkId of the barber
  customerId?: string;       // null if walk-in (manual booking)
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;  // Stripe Payment Intent ID
  amountPence: number;       // Locked-in price of the service at time of booking
  isManual: boolean;         // true = added by barber (walk-in/WhatsApp)
  notes?: string;
  customerName?: string;     // For walk-ins without a customer account
  customerPhone?: string;    // For walk-ins without a customer account
  createdAt: Date;
  updatedAt: Date;
}
