import mongoose, { Schema, Document } from 'mongoose';
import { IBooking, BookingStatus, PaymentStatus } from '@domain/entities/Booking';

export interface IBookingDocument extends Omit<IBooking, 'id'>, Document { }

const bookingSchema = new Schema<IBookingDocument>(
  {
    barberId: { type: String, required: true, index: true },
    customerId: { type: String, default: null },
    serviceId: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as BookingStatus[],
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'DEPOSIT_PAID', 'PAID_IN_FULL'] as PaymentStatus[],
      default: 'UNPAID',
    },
    paymentIntentId: { type: String, sparse: true },
    isManual: { type: Boolean, default: false },
    notes: { type: String, trim: true },
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
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

// Critical compound index for availability queries — find all bookings
// for a barber on a given day efficiently
bookingSchema.index({ barberId: 1, startTime: 1, endTime: 1 });

// Index for looking up bookings by payment intent (webhook handler)
bookingSchema.index({ paymentIntentId: 1 }, { sparse: true });

// Index for customer's upcoming bookings
bookingSchema.index({ customerId: 1, startTime: 1 });

export const BookingModel = mongoose.model<IBookingDocument>('Booking', bookingSchema);
