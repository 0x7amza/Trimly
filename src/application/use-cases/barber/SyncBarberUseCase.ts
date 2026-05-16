import slugify from 'slugify';
import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { IBarber } from '@domain/entities/Barber';

/**
 * Sync Barber Use Case — upserts the barber record from Clerk user data.
 * Called after the barber first authenticates via Clerk.
 *
 * If this is the first sync (new barber), automatically creates a Shop
 * and sets the barber as OWNER.
 */
export class SyncBarberUseCase {
  constructor(
    private barberRepo: IBarberRepository,
    private shopRepo: IShopRepository,
  ) {}

  async execute(data: {
    clerkId: string;
    name: string;
    email: string;
  }): Promise<IBarber> {
    // Check if barber already exists
    const existingBarber = await this.barberRepo.findByClerkId(data.clerkId);

    // Generate a URL-friendly slug from the name
    let slug = slugify(data.name, { lower: true, strict: true });

    // Ensure slug uniqueness
    const existingSlug = await this.barberRepo.findBySlug(slug);
    if (existingSlug && existingSlug.clerkId !== data.clerkId) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Upsert barber
    const barber = await this.barberRepo.upsertByClerkId(data.clerkId, {
      name: data.name,
      email: data.email,
      slug,
    });

    // If this is a new barber (no shop yet), auto-create a shop
    if (!existingBarber?.shopId) {
      const existingShop = await this.shopRepo.findByOwnerId(data.clerkId);
      if (!existingShop) {
        let shopSlug = slugify(data.name, { lower: true, strict: true });
        const existingShopSlug = await this.shopRepo.findBySlug(shopSlug);
        if (existingShopSlug) {
          shopSlug = `${shopSlug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        const shop = await this.shopRepo.create({
          ownerId: data.clerkId,
          name: data.name,
          slug: shopSlug,
          subscription: {
            plan: 'NONE',
            status: 'EXPIRED',
          },
          maxBarbersIncluded: 5,
        });

        // Link barber to shop
        await this.barberRepo.update(data.clerkId, {
          shopId: shop.id,
          role: 'OWNER',
        });

        barber.shopId = shop.id;
        barber.role = 'OWNER';
      }
    }

    return barber;
  }
}
