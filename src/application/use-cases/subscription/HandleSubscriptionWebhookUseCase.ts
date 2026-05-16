import Stripe from 'stripe';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { IPaymentService } from '@application/interfaces/IPaymentService';
import { SubscriptionPlan, SubscriptionStatus } from '@domain/entities/Shop';

/**
 * Handle Subscription Webhook Use Case.
 * Processes Stripe subscription lifecycle events.
 *
 * Events handled:
 * - checkout.session.completed → activate subscription after successful payment
 * - customer.subscription.updated → sync plan/status/period changes
 * - customer.subscription.deleted → mark subscription as expired
 * - invoice.payment_failed → mark as past_due with 3-day grace period + email
 */
export class HandleSubscriptionWebhookUseCase {
  constructor(
    private shopRepo: IShopRepository,
    private paymentService: IPaymentService,
  ) { }

  async execute(payload: Buffer, signature: string): Promise<void> {
    const event = this.paymentService.verifyWebhookSignature(payload, signature);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          await this.handleCheckoutCompleted(session);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handlePaymentFailed(invoice);
        break;
      }

      default:
        // Not a subscription event — ignore silently
        break;
    }
  }

  /**
   * Checkout completed — activate the subscription.
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const shopId = session.metadata?.shopId;
    if (!shopId) {
      console.warn('⚠️  Checkout session missing shopId metadata');
      return;
    }

    const shop = await this.shopRepo.findById(shopId);
    if (!shop) {
      console.warn(`⚠️  No shop found for ID: ${shopId}`);
      return;
    }

    await this.shopRepo.updateSubscription(shop.id, {
      stripeSubscriptionId: session.subscription as string,
      stripeCustomerId: session.customer as string,
      status: 'ACTIVE',
    });

    console.log(`✅ Subscription activated for shop ${shop.id}`);
  }

  /**
   * Subscription updated — sync plan, status, and period.
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const shopId = subscription.metadata?.shopId;
    if (!shopId) return;

    const shop = await this.shopRepo.findById(shopId);
    if (!shop) return;

    // Map Stripe status to our domain status
    const statusMap: Record<string, SubscriptionStatus> = {
      active: 'ACTIVE',
      trialing: 'TRIALING',
      past_due: 'PAST_DUE',
      canceled: 'CANCELLED',
      unpaid: 'EXPIRED',
    };

    const status = statusMap[subscription.status] || 'EXPIRED';
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Determine plan from price interval
    let plan: SubscriptionPlan = 'NONE';
    if (subscription.items.data.length > 0) {
      const interval = subscription.items.data[0].price.recurring?.interval;
      plan = interval === 'year' ? 'YEARLY' : 'MONTHLY';
    }

    await this.shopRepo.updateSubscription(shop.id, {
      plan,
      status,
      currentPeriodEnd,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : undefined,
    });

    console.log(`ℹ️  Subscription updated for shop ${shop.id}: ${status} (${plan})`);
  }

  /**
   * Subscription deleted — mark as expired.
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const shopId = subscription.metadata?.shopId;
    if (!shopId) return;

    const shop = await this.shopRepo.findById(shopId);
    if (!shop) return;

    await this.shopRepo.updateSubscription(shop.id, {
      status: 'EXPIRED',
      plan: 'NONE',
      cancelledAt: new Date(),
    });

    console.log(`❌ Subscription expired for shop ${shop.id}`);
  }

  /**
   * Payment failed — set 3-day grace period and send email notification.
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    if (!customerId) return;

    const shop = await this.shopRepo.findByStripeCustomerId(customerId);
    if (!shop) return;

    // Set 3-day grace period from now
    const gracePeriodEndsAt = new Date();
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 3);

    await this.shopRepo.updateSubscription(shop.id, {
      status: 'PAST_DUE',
      gracePeriodEndsAt,
    });

    // Send email notification about payment failure
    // TODO: Integrate with an email service (SendGrid, SES, etc.)
    console.log(`⚠️  Payment failed for shop ${shop.id}. Grace period until ${gracePeriodEndsAt.toISOString()}`);
    console.log(`📧  EMAIL NOTIFICATION NEEDED: Shop owner should be notified about payment failure`);
    console.log(`    Subject: "Action Required: Your Trimly subscription payment failed"`);
    console.log(`    Message: "Your payment has failed. Please update your payment method within 3 days to avoid service interruption."`);
  }
}
