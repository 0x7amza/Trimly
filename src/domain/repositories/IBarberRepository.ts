import { IBarber } from '@domain/entities/Barber';

/**
 * Barber repository contract.
 * Infrastructure layer must implement this interface.
 */
export interface IBarberRepository {
  findByClerkId(clerkId: string): Promise<IBarber | null>;
  findBySlug(slug: string): Promise<IBarber | null>;
  findByShopId(shopId: string): Promise<IBarber[]>;
  create(barber: Partial<IBarber>): Promise<IBarber>;
  update(clerkId: string, data: Partial<IBarber>): Promise<IBarber | null>;
  upsertByClerkId(clerkId: string, data: Partial<IBarber>): Promise<IBarber>;
}
