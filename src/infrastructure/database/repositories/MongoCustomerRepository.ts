import { ICustomerRepository } from '@domain/repositories/ICustomerRepository';
import { ICustomer } from '@domain/entities/Customer';
import { CustomerModel } from '../models/CustomerModel';

export class MongoCustomerRepository implements ICustomerRepository {
  async findById(id: string): Promise<ICustomer | null> {
    const doc = await CustomerModel.findById(id).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findByPhone(phone: string): Promise<ICustomer | null> {
    const doc = await CustomerModel.findOne({ phone }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<ICustomer | null> {
    const doc = await CustomerModel.findOne({ email }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async create(customer: Partial<ICustomer>): Promise<ICustomer> {
    const doc = await CustomerModel.create(customer);
    return this.toEntity(doc.toObject());
  }

  async update(id: string, data: Partial<ICustomer>): Promise<ICustomer | null> {
    const doc = await CustomerModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, lean: true },
    );
    return doc ? this.toEntity(doc) : null;
  }

  private toEntity(doc: any): ICustomer {
    return {
      id: doc._id.toString(),
      phone: doc.phone,
      email: doc.email,
      name: doc.name,
      passwordHash: doc.passwordHash,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
