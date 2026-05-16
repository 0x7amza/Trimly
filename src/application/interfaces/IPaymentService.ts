import Stripe from 'stripe';

/**
 * Payment service interface — abstracts Stripe operations.
 */
export interface IPaymentService {
  /**
   * Create a Stripe Payment Intent for a booking deposit/full payment.
   * @param amount  Amount in smallest currency unit (pence)
   * @param currency  ISO currency code (e.g. 'gbp')
   * @param metadata  Additional metadata to attach (e.g. bookingId, barberId)
   * @returns The client secret and payment intent ID
   */
  createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }>;

  /**
   * Create a Stripe Checkout Session for subscription signup.
   */
  createSubscriptionCheckout(params: {
    priceId: string;
    shopId: string;
    stripeCustomerId?: string;
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
  }): Promise<{ sessionUrl: string; stripeCustomerId: string }>;

  /**
   * Create a Stripe Billing Portal session for managing subscriptions.
   */
  createBillingPortalSession(
    stripeCustomerId: string,
    returnUrl: string,
  ): Promise<{ portalUrl: string }>;

  /**
   * Verify the Stripe webhook signature and parse the event.
   */
  verifyWebhookSignature(
    payload: Buffer,
    signature: string,
  ): Stripe.Event;
}
