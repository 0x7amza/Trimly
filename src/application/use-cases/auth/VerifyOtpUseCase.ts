import { IOtpService } from '@application/interfaces/IOtpService';
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository';
import { UnauthorizedError } from '@shared/errors/AppError';
import { signToken } from '@shared/utils/jwt';

/**
 * Verify OTP Use Case — validates the code and returns a JWT.
 * Creates the customer record if it's their first time (phone-based registration).
 */
export class VerifyOtpUseCase {
  constructor(
    private otpService: IOtpService,
    private customerRepo: ICustomerRepository,
  ) {}

  async execute(phone: string, code: string): Promise<{ token: string; isNewUser: boolean }> {
    const isValid = await this.otpService.verifyOtp(phone, code);
    if (!isValid) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }

    // Find or create the customer
    let customer = await this.customerRepo.findByPhone(phone);
    let isNewUser = false;

    if (!customer) {
      customer = await this.customerRepo.create({
        phone,
        passwordHash: '', // OTP-based users don't have passwords
      });
      isNewUser = true;
    }

    const token = signToken({
      customerId: customer.id,
      phone: customer.phone,
    });

    return { token, isNewUser };
  }
}
