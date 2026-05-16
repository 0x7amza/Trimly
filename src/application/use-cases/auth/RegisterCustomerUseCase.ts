import bcrypt from 'bcrypt';
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository';
import { ConflictError, ValidationError } from '@shared/errors/AppError';
import { signToken } from '@shared/utils/jwt';

/**
 * Register Customer Use Case — email & password registration.
 */
export class RegisterCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(data: {
    phone: string;
    email: string;
    password: string;
    name?: string;
  }): Promise<{ token: string }> {
    // Check if customer already exists
    const existingByPhone = await this.customerRepo.findByPhone(data.phone);
    if (existingByPhone) {
      throw new ConflictError('An account with this phone number already exists');
    }

    if (data.email) {
      const existingByEmail = await this.customerRepo.findByEmail(data.email);
      if (existingByEmail) {
        throw new ConflictError('An account with this email already exists');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    const customer = await this.customerRepo.create({
      phone: data.phone,
      email: data.email,
      name: data.name,
      passwordHash,
    });

    const token = signToken({
      customerId: customer.id,
      phone: customer.phone,
      email: customer.email,
    });

    return { token };
  }
}
