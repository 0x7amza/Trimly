import { IShopRepository } from '@domain/repositories/IShopRepository';
import { IShop } from '@domain/entities/Shop';
import { ShopModel } from '@infrastructure/database/models/ShopModel';

export class MongoShopRepository implements IShopRepository {
  async findById(id: string): Promise<IShop | null> {
    const doc = await ShopModel.findById(id).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findByOwnerId(ownerId: string): Promise<IShop | null> {
    const doc = await ShopModel.findOne({ ownerId }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findBySlug(slug: string): Promise<IShop | null> {
    const doc = await ShopModel.findOne({ slug }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<IShop | null> {
    const doc = await ShopModel.findOne({ 'subscription.stripeCustomerId': stripeCustomerId }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async create(shop: Partial<IShop>): Promise<IShop> {
    const doc = await ShopModel.create(shop);
    return this.toEntity(doc.toObject());
  }

  async update(id: string, data: Partial<IShop>): Promise<IShop | null> {
    const doc = await ShopModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async updateSubscription(id: string, subscription: Partial<IShop['subscription']>): Promise<IShop | null> {
    const updateFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(subscription)) {
      updateFields[`subscription.${key}`] = value;
    }
    const doc = await ShopModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  private toEntity(doc: any): IShop {
    return {
      id: doc._id?.toString() || doc.id,
      ownerId: doc.ownerId,
      name: doc.name,
      slug: doc.slug,
      subscription: doc.subscription || { plan: 'NONE', status: 'EXPIRED' },
      maxBarbersIncluded: doc.maxBarbersIncluded ?? 5,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
