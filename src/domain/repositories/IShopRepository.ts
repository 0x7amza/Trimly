import { IShop } from '@domain/entities/Shop';

/**
 * Shop repository contract.
 */
export interface IShopRepository {
  findById(id: string): Promise<IShop | null>;
  findByOwnerId(ownerId: string): Promise<IShop | null>;
  findBySlug(slug: string): Promise<IShop | null>;
  findByStripeCustomerId(stripeCustomerId: string): Promise<IShop | null>;
  create(shop: Partial<IShop>): Promise<IShop>;
  update(id: string, data: Partial<IShop>): Promise<IShop | null>;
  updateSubscription(id: string, subscription: Partial<IShop['subscription']>): Promise<IShop | null>;
}
