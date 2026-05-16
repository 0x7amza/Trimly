import slugify from 'slugify';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IBarber } from '@domain/entities/Barber';
import { NotFoundError, ForbiddenError, ValidationError } from '@shared/errors/AppError';

/**
 * Add Barber to Shop Use Case.
 * Only the shop OWNER can add barbers.
 *
 * Pricing model:
 * - First 5 barbers included in the base subscription.
 * - $3/month per additional barber beyond 5.
 */
export class AddBarberToShopUseCase {
  constructor(
    private shopRepo: IShopRepository,
    private barberRepo: IBarberRepository,
  ) { }

  async execute(data: {
    ownerClerkId: string;
    barberClerkId: string;
    barberName: string;
    barberEmail: string;
  }): Promise<IBarber> {
    // 1. Verify the requester is the shop OWNER
    const shop = await this.shopRepo.findByOwnerId(data.ownerClerkId);
    if (!shop) throw new NotFoundError('Shop');

    const owner = await this.barberRepo.findByClerkId(data.ownerClerkId);
    if (!owner || owner.role !== 'OWNER') {
      throw new ForbiddenError('Only the shop owner can add barbers');
    }

    // 2. Check barber count
    const existingBarbers = await this.barberRepo.findByShopId(shop.id);
    const currentCount = existingBarbers.length;

    if (currentCount >= shop.maxBarbersIncluded) {
      // Barbers beyond 5 are allowed but will incur extra charges
      // This is informational — the actual billing is handled via Stripe
      console.log(`ℹ️  Shop ${shop.id} adding barber #${currentCount + 1} (extra charge applies)`);
    }

    // 3. Check if barber already exists in a shop
    const existingBarber = await this.barberRepo.findByClerkId(data.barberClerkId);
    if (existingBarber?.shopId) {
      throw new ValidationError('This barber is already assigned to a shop');
    }

    // 4. Generate slug for the barber
    let slug = slugify(data.barberName, { lower: true, strict: true });
    const existingSlug = await this.barberRepo.findBySlug(slug);
    if (existingSlug && existingSlug.clerkId !== data.barberClerkId) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // 5. Upsert barber with shop assignment
    return this.barberRepo.upsertByClerkId(data.barberClerkId, {
      name: data.barberName,
      email: data.barberEmail,
      slug,
      shopId: shop.id,
      role: 'BARBER',
    });
  }
}
