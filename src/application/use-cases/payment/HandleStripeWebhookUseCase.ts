import Stripe from 'stripe';
import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IPaymentService } from '@application/interfaces/IPaymentService';

/**
 * Handle Stripe Webhook Use Case.
 * Processes payment_intent.succeeded events to confirm bookings.
 */
export class HandleStripeWebhookUseCase {
  constructor(
    private bookingRepo: IBookingRepository,
    private paymentService: IPaymentService,
  ) {}

  async execute(payload: Buffer, signature: string): Promise<void> {
    // Verify webhook signature (throws if invalid)
    const event = this.paymentService.verifyWebhookSignature(payload, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(paymentIntent);
        break;
      }

      default:
        console.log(`ℹ️  Unhandled Stripe event: ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const booking = await this.bookingRepo.findByPaymentIntentId(paymentIntent.id);
    if (!booking) {
      console.warn(`⚠️  No booking found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Only update if still pending (idempotency)
    if (booking.status === 'PENDING') {
      await this.bookingRepo.update(booking.id, {
        status: 'CONFIRMED',
        paymentStatus: 'PAID_IN_FULL',
      });
      console.log(`✅ Booking ${booking.id} confirmed via Stripe payment`);
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const booking = await this.bookingRepo.findByPaymentIntentId(paymentIntent.id);
    if (!booking) return;

    if (booking.status === 'PENDING') {
      await this.bookingRepo.update(booking.id, {
        status: 'CANCELLED',
      });
      console.log(`❌ Booking ${booking.id} cancelled due to payment failure`);
    }
  }
}
