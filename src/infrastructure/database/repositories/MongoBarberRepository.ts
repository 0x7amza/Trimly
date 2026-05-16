import { IBarberRepository } from '@domain/repositories/IBarberRepository';
import { IBarber } from '@domain/entities/Barber';
import { BarberModel } from '../models/BarberModel';

export class MongoBarberRepository implements IBarberRepository {
  async findByClerkId(clerkId: string): Promise<IBarber | null> {
    const doc = await BarberModel.findOne({ clerkId }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findBySlug(slug: string): Promise<IBarber | null> {
    const doc = await BarberModel.findOne({ slug }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async create(barber: Partial<IBarber>): Promise<IBarber> {
    const doc = await BarberModel.create(barber);
    return this.toEntity(doc.toObject());
  }

  async update(clerkId: string, data: Partial<IBarber>): Promise<IBarber | null> {
    const doc = await BarberModel.findOneAndUpdate(
      { clerkId },
      { $set: data },
      { new: true, lean: true },
    );
    return doc ? this.toEntity(doc) : null;
  }

  async upsertByClerkId(clerkId: string, data: Partial<IBarber>): Promise<IBarber> {
    const doc = await BarberModel.findOneAndUpdate(
      { clerkId },
      { $set: { ...data, clerkId } },
      { new: true, upsert: true, lean: true },
    );
    return this.toEntity(doc);
  }

  private toEntity(doc: any): IBarber {
    return {
      clerkId: doc.clerkId,
      name: doc.name,
      email: doc.email,
      slug: doc.slug,
      phone: doc.phone,
      shopName: doc.shopName,
      address: doc.address,
      bio: doc.bio,
      businessHours: doc.businessHours,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
