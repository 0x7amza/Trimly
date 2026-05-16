import { IOtpService } from '@application/interfaces/IOtpService';
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository';
import { ValidationError } from '@shared/errors/AppError';

/**
 * Send OTP Use Case — generates and sends a verification code to a phone number.
 */
export class SendOtpUseCase {
  constructor(
    private otpService: IOtpService,
    private customerRepo: ICustomerRepository,
  ) {}

  async execute(phone: string): Promise<void> {
    if (!phone || phone.length < 10) {
      throw new ValidationError('Valid phone number is required');
    }

    await this.otpService.sendOtp(phone);
  }
}
