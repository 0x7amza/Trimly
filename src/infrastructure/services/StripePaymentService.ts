import Stripe from 'stripe';
import { IPaymentService } from '@application/interfaces/IPaymentService';
import { stripe } from '@config/stripe';
import { config } from '@config/env';

/**
 * Stripe payment service implementation.
 * Handles Payment Intent creation and webhook signature verification.
 */
export class StripePaymentService implements IPaymentService {
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      config.STRIPE_WEBHOOK_SECRET,
    );
  }
}
