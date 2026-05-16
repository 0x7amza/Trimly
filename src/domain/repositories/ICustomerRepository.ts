import { ICustomer } from '@domain/entities/Customer';

/**
 * Customer repository contract.
 */
export interface ICustomerRepository {
  findById(id: string): Promise<ICustomer | null>;
  findByPhone(phone: string): Promise<ICustomer | null>;
  findByEmail(email: string): Promise<ICustomer | null>;
  create(customer: Partial<ICustomer>): Promise<ICustomer>;
  update(id: string, data: Partial<ICustomer>): Promise<ICustomer | null>;
}
