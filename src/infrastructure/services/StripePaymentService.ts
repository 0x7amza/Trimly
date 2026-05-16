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

  async createSubscriptionCheckout(params: {
    priceId: string;
    shopId: string;
    stripeCustomerId?: string;
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
  }): Promise<{ sessionUrl: string; stripeCustomerId: string }> {
    // Create or reuse Stripe customer
    let customerId = params.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: params.customerEmail,
        metadata: { shopId: params.shopId },
      });
      customerId = customer.id;
    }

    const sessionParams: any = {
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: { shopId: params.shopId },
      subscription_data: {
        metadata: { shopId: params.shopId },
      },
    };

    // Add trial period if specified
    if (params.trialDays) {
      sessionParams.subscription_data.trial_period_days = params.trialDays;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      sessionUrl: session.url!,
      stripeCustomerId: customerId,
    };
  }

  async createBillingPortalSession(
    stripeCustomerId: string,
    returnUrl: string,
  ): Promise<{ portalUrl: string }> {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return { portalUrl: session.url };
  }

  verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      config.STRIPE_WEBHOOK_SECRET,
    );
  }
}
