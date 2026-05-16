import mongoose, { Schema, Document } from 'mongoose';
import { IService } from '@domain/entities/Service';

export interface IServiceDocument extends Omit<IService, 'id'>, Document {}

const serviceSchema = new Schema<IServiceDocument>(
  {
    barberId: {
      type: String,
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 5 },
    isActive: { type: Boolean, default: true },
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

// Compound index for fetching all active services for a barber
serviceSchema.index({ barberId: 1, isActive: 1 });

export const ServiceModel = mongoose.model<IServiceDocument>('Service', serviceSchema);
