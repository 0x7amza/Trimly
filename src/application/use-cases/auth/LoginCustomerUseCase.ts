import bcrypt from 'bcrypt';
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository';
import { UnauthorizedError } from '@shared/errors/AppError';
import { signToken } from '@shared/utils/jwt';

/**
 * Login Customer Use Case — email/phone & password authentication.
 */
export class LoginCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(data: {
    identifier: string;  // Can be email or phone
    password: string;
  }): Promise<{ token: string }> {
    // Try finding by email first, then by phone
    let customer = await this.customerRepo.findByEmail(data.identifier);
    if (!customer) {
      customer = await this.customerRepo.findByPhone(data.identifier);
    }

    if (!customer) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!customer.passwordHash) {
      throw new UnauthorizedError('This account uses OTP login. Please use the OTP flow.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, customer.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = signToken({
      customerId: customer.id,
      phone: customer.phone,
      email: customer.email,
    });

    return { token };
  }
}
