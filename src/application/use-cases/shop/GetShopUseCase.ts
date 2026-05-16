import { IShopRepository } from '@domain/repositories/IShopRepository';
import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IShop } from '@domain/entities/Shop';
import { IBarber } from '@domain/entities/Barber';
import { NotFoundError } from '@shared/errors/AppError';

interface ShopWithBarbers {
  shop: IShop;
  barbers: IBarber[];
}

/**
 * Get Shop Use Case.
 * Returns shop details with all barbers for the public shop page.
 */
export class GetShopUseCase {
  constructor(
    private shopRepo: IShopRepository,
    private barberRepo: IBarberRepository,
  ) {}

  async executeByOwnerId(ownerId: string): Promise<ShopWithBarbers> {
    const shop = await this.shopRepo.findByOwnerId(ownerId);
    if (!shop) throw new NotFoundError('Shop');

    const barbers = await this.barberRepo.findByShopId(shop.id);
    return { shop, barbers };
  }

  async executeBySlug(slug: string): Promise<ShopWithBarbers> {
    const shop = await this.shopRepo.findBySlug(slug);
    if (!shop) throw new NotFoundError('Shop');

    const barbers = await this.barberRepo.findByShopId(shop.id);
    return { shop, barbers };
  }
}
