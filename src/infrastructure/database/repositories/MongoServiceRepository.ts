import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { IService } from '@domain/entities/Service';
import { ServiceModel } from '../models/ServiceModel';

export class MongoServiceRepository implements IServiceRepository {
  async findById(id: string): Promise<IService | null> {
    const doc = await ServiceModel.findById(id).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findByBarberId(barberId: string): Promise<IService[]> {
    const docs = await ServiceModel.find({ barberId, isActive: true }).lean();
    return docs.map((doc) => this.toEntity(doc));
  }

  async create(service: Partial<IService>): Promise<IService> {
    const doc = await ServiceModel.create(service);
    return this.toEntity(doc.toObject());
  }

  async update(id: string, data: Partial<IService>): Promise<IService | null> {
    const doc = await ServiceModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, lean: true },
    );
    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete — mark as inactive rather than removing the document
    const result = await ServiceModel.findByIdAndUpdate(id, { isActive: false });
    return result !== null;
  }

  private toEntity(doc: any): IService {
    return {
      id: doc._id.toString(),
      barberId: doc.barberId,
      name: doc.name,
      price: doc.price,
      durationMinutes: doc.durationMinutes,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
