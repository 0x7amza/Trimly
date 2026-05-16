import slugify from 'slugify';
import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IBarber } from '@domain/entities/Barber';

/**
 * Sync Barber Use Case — upserts the barber record from Clerk user data.
 * Called after the barber first authenticates via Clerk.
 */
export class SyncBarberUseCase {
  constructor(private barberRepo: IBarberRepository) {}

  async execute(data: {
    clerkId: string;
    name: string;
    email: string;
  }): Promise<IBarber> {
    // Generate a URL-friendly slug from the name
    let slug = slugify(data.name, { lower: true, strict: true });

    // Ensure slug uniqueness
    const existing = await this.barberRepo.findBySlug(slug);
    if (existing && existing.clerkId !== data.clerkId) {
      // Append a random suffix if slug is taken by another barber
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    return this.barberRepo.upsertByClerkId(data.clerkId, {
      name: data.name,
      email: data.email,
      slug,
    });
  }
}
