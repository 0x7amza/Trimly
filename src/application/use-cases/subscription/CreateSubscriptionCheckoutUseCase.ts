import { IShopRepository } from '@domain/repositories/IShopRepository';
import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IPaymentService } from '@application/interfaces/IPaymentService';
import { config } from '@config/env';
import { NotFoundError, ForbiddenError } from '@shared/errors/AppError';

/**
 * Create Subscription Checkout Use Case.
 * Creates a Stripe Checkout Session for the shop owner to subscribe.
 *
 * Plans:
 * - Monthly: $29/month
 * - Yearly: $23/month ($276/year)
 * - 14-day free trial on first subscription
 */
export class CreateSubscriptionCheckoutUseCase {
  constructor(
    private shopRepo: IShopRepository,
    private barberRepo: IBarberRepository,
    private paymentService: IPaymentService,
  ) {}

  async execute(data: {
    ownerClerkId: string;
    plan: 'MONTHLY' | 'YEARLY';
  }): Promise<{ sessionUrl: string }> {
    // 1. Verify the requester is the shop OWNER
    const shop = await this.shopRepo.findByOwnerId(data.ownerClerkId);
    if (!shop) throw new NotFoundError('Shop');

    const owner = await this.barberRepo.findByClerkId(data.ownerClerkId);
    if (!owner || owner.role !== 'OWNER') {
      throw new ForbiddenError('Only the shop owner can manage subscriptions');
    }

    // 2. Determine the price ID
    const priceId = data.plan === 'MONTHLY'
      ? config.STRIPE_MONTHLY_PRICE_ID
      : config.STRIPE_YEARLY_PRICE_ID;

    // 3. Determine if this is their first subscription (eligible for trial)
    const isFirstSubscription = !shop.subscription.stripeSubscriptionId;

    // 4. Create Stripe Checkout Session
    const { sessionUrl, stripeCustomerId } = await this.paymentService.createSubscriptionCheckout({
      priceId,
      shopId: shop.id,
      stripeCustomerId: shop.subscription.stripeCustomerId,
      customerEmail: owner.email,
      successUrl: `${config.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${config.FRONTEND_URL}/subscription/cancelled`,
      trialDays: isFirstSubscription ? 14 : undefined,
    });

    // 5. Save Stripe customer ID if new
    if (!shop.subscription.stripeCustomerId) {
      await this.shopRepo.updateSubscription(shop.id, {
        stripeCustomerId,
      });
    }

    return { sessionUrl };
  }
}
