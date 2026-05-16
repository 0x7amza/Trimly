import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpDocument extends Document {
  phone: string;
  code: string;       // Hashed OTP code
  expiresAt: Date;
  verified: boolean;
}

const otpSchema = new Schema<IOtpDocument>(
  {
    phone: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// TTL index — MongoDB automatically deletes documents 5 minutes after expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = mongoose.model<IOtpDocument>('Otp', otpSchema);
