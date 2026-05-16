import { Request, Response, NextFunction } from 'express';
import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { ForbiddenError } from '@shared/errors/AppError';

/**
 * Subscription Guard Middleware Factory.
 *
 * Checks that the barber's shop has an active subscription before
 * allowing booking or service management operations.
 *
 * Grace period logic:
 * - PAST_DUE status is allowed if gracePeriodEndsAt > now.
 * - After grace period expires, access is blocked.
 *
 * @param barberRepo - Barber repository for looking up shop membership
 * @param shopRepo - Shop repository for checking subscription status
 * @param mode - 'barber' (uses req.barberClerkId) or 'customer' (looks up barberId from request)
 */
export function createSubscriptionGuard(
  barberRepo: IBarberRepository,
  shopRepo: IShopRepository,
  mode: 'barber' | 'customer' = 'barber',
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      let barberId: string | undefined;

      if (mode === 'barber') {
        barberId = req.barberClerkId;
      } else {
        // For customer bookings, the barberId comes from the request body
        barberId = req.body?.barberId;
      }

      if (!barberId) {
        throw new ForbiddenError('Unable to verify subscription status');
      }

      // Look up the barber to find their shop
      const barber = await barberRepo.findByClerkId(barberId);
      if (!barber?.shopId) {
        throw new ForbiddenError('No shop found. Please create a shop first.');
      }

      // Look up the shop's subscription
      const shop = await shopRepo.findById(barber.shopId);
      if (!shop) {
        throw new ForbiddenError('Shop not found');
      }

      const { status, gracePeriodEndsAt } = shop.subscription;

      // Allow ACTIVE and TRIALING statuses
      if (status === 'ACTIVE' || status === 'TRIALING') {
        return next();
      }

      // Allow PAST_DUE within grace period (3 days)
      if (status === 'PAST_DUE' && gracePeriodEndsAt) {
        if (new Date() < new Date(gracePeriodEndsAt)) {
          return next();
        }
      }

      // Block everything else
      throw new ForbiddenError(
        'Your subscription is inactive. Please renew your subscription to continue using Trimly.',
      );
    } catch (error) {
      next(error);
    }
  };
}
