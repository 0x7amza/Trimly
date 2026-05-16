import slugify from 'slugify';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IShop } from '@domain/entities/Shop';
import { ConflictError } from '@shared/errors/AppError';

/**
 * Create Shop Use Case.
 * Called when a barber first creates their business account.
 * The creating barber becomes the shop OWNER.
 */
export class CreateShopUseCase {
  constructor(
    private shopRepo: IShopRepository,
    private barberRepo: IBarberRepository,
  ) {}

  async execute(data: {
    ownerId: string;  // clerkId
    name: string;
  }): Promise<IShop> {
    // Check if barber already owns a shop
    const existingShop = await this.shopRepo.findByOwnerId(data.ownerId);
    if (existingShop) {
      throw new ConflictError('You already own a shop');
    }

    // Generate unique slug
    let slug = slugify(data.name, { lower: true, strict: true });
    const existingSlug = await this.shopRepo.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Create the shop with default subscription (EXPIRED/NONE)
    const shop = await this.shopRepo.create({
      ownerId: data.ownerId,
      name: data.name,
      slug,
      subscription: {
        plan: 'NONE',
        status: 'EXPIRED',
      },
      maxBarbersIncluded: 5,
    });

    // Link the barber to this shop as OWNER
    await this.barberRepo.update(data.ownerId, {
      shopId: shop.id,
      role: 'OWNER',
    });

    return shop;
  }
}
