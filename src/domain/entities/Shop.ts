/**
 * Subscription plan type.
 */
export type SubscriptionPlan = 'MONTHLY' | 'YEARLY' | 'NONE';

/**
 * Subscription status lifecycle:
 *   TRIALING → ACTIVE → PAST_DUE → EXPIRED
 *                      ↘ CANCELLED
 */
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

/**
 * Embedded subscription details within a Shop.
 */
export interface ISubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
  trialEndsAt?: Date;
  gracePeriodEndsAt?: Date;         // 3 days after payment failure
  cancelledAt?: Date;
}

/**
 * Shop entity — the subscribing business account.
 * Groups multiple barbers under one subscription.
 */
export interface IShop {
  id: string;
  ownerId: string;                  // clerkId of the admin barber
  name: string;
  slug: string;
  subscription: ISubscription;
  maxBarbersIncluded: number;       // Default: 5
  createdAt: Date;
  updatedAt: Date;
}
