import { IShopRepository } from '@domain/repositories/IShopRepository';
import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IPaymentService } from '@application/interfaces/IPaymentService';
import { config } from '@config/env';
import { NotFoundError, ForbiddenError } from '@shared/errors/AppError';

/**
 * Create Billing Portal Use Case.
 * Generates a Stripe Billing Portal URL so the owner can manage
 * their subscription, update payment method, or cancel.
 */
export class CreateBillingPortalUseCase {
  constructor(
    private shopRepo: IShopRepository,
    private barberRepo: IBarberRepository,
    private paymentService: IPaymentService,
  ) {}

  async execute(ownerClerkId: string): Promise<{ portalUrl: string }> {
    const shop = await this.shopRepo.findByOwnerId(ownerClerkId);
    if (!shop) throw new NotFoundError('Shop');

    const owner = await this.barberRepo.findByClerkId(ownerClerkId);
    if (!owner || owner.role !== 'OWNER') {
      throw new ForbiddenError('Only the shop owner can access billing');
    }

    if (!shop.subscription.stripeCustomerId) {
      throw new NotFoundError('No subscription found. Please subscribe first.');
    }

    return this.paymentService.createBillingPortalSession(
      shop.subscription.stripeCustomerId,
      `${config.FRONTEND_URL}/dashboard`,
    );
  }
}
