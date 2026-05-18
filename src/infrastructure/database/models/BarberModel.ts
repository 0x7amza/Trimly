import mongoose, { Schema, Document } from 'mongoose';
import { IBarber, IBusinessHours } from '@domain/entities/Barber';

export interface IBarberDocument extends Omit<IBarber, 'clerkId'>, Document {
  clerkId: string;
}

const businessHoursSchema = new Schema<IBusinessHours>(
  {
    day: { type: Number, required: true, min: 0, max: 6 },
    open: { type: String, required: true },
    close: { type: String, required: true },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false },
);

const barberSchema = new Schema<IBarberDocument>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    shopId: {
      type: String,
      index: true,
    },
    role: {
      type: String,
      enum: ['OWNER', 'BARBER'],
      default: 'OWNER',
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, trim: true },
    shopName: { type: String, trim: true },
    address: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
    avatarUrl: { type: String, trim: true },
    timezone: { type: String, default: 'UTC' },
    businessHours: {
      type: [businessHoursSchema],
      default: [
        { day: 0, open: '09:00', close: '17:00', isClosed: true },  // Sunday — closed
        { day: 1, open: '09:00', close: '18:00', isClosed: false },
        { day: 2, open: '09:00', close: '18:00', isClosed: false },
        { day: 3, open: '09:00', close: '18:00', isClosed: false },
        { day: 4, open: '09:00', close: '18:00', isClosed: false },
        { day: 5, open: '09:00', close: '18:00', isClosed: false },
        { day: 6, open: '09:00', close: '17:00', isClosed: false },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const BarberModel = mongoose.model<IBarberDocument>('Barber', barberSchema);
