/**
 * OTP service interface — abstraction over the delivery mechanism.
 * Can be implemented by Twilio, Vonage, or any other provider.
 */
export interface IOtpService {
  /**
   * Generate a new OTP, store it, and send it to the phone number.
   */
  sendOtp(phone: string): Promise<void>;

  /**
   * Verify the OTP code for a given phone number.
   * Returns true if valid, false if expired or incorrect.
   */
  verifyOtp(phone: string, code: string): Promise<boolean>;
}
