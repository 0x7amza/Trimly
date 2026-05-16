import bcrypt from 'bcrypt';
import { IOtpService } from '@application/interfaces/IOtpService';
import { OtpModel } from '../database/models/OtpModel';
import { config } from '@config/env';

/**
 * Twilio-based OTP service implementation.
 * Generates a 6-digit OTP, stores it hashed in MongoDB (with TTL),
 * and sends it via Twilio WhatsApp/SMS.
 */
export class TwilioOtpService implements IOtpService {
  private twilioClient: any;

  constructor() {
    // Dynamically import Twilio to avoid hard dependency in tests
    const twilio = require('twilio');
    this.twilioClient = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
  }

  async sendOtp(phone: string): Promise<void> {
    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the code before storing
    const hashedCode = await bcrypt.hash(code, 10);

    // Delete any existing OTPs for this phone
    await OtpModel.deleteMany({ phone });

    // Store the hashed OTP with a 5-minute expiry
    await OtpModel.create({
      phone,
      code: hashedCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send via Twilio WhatsApp
    try {
      await this.twilioClient.messages.create({
        body: `Your Trimly verification code is: ${code}. Valid for 5 minutes.`,
        from: `whatsapp:${config.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${phone}`,
      });
    } catch (error) {
      // Fallback to SMS if WhatsApp fails
      await this.twilioClient.messages.create({
        body: `Your Trimly verification code is: ${code}. Valid for 5 minutes.`,
        from: config.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    }

    console.log(`📱 OTP sent to ${phone}`);
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otpRecord = await OtpModel.findOne({
      phone,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) return false;

    const isValid = await bcrypt.compare(code, otpRecord.code);

    if (isValid) {
      // Mark as verified and delete
      await OtpModel.deleteOne({ _id: otpRecord._id });
      return true;
    }

    return false;
  }
}
