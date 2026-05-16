import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from '@domain/entities/Customer';

export interface ICustomerDocument extends Omit<ICustomer, 'id'>, Document {}

const customerSchema = new Schema<ICustomerDocument>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, trim: true },
    passwordHash: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export const CustomerModel = mongoose.model<ICustomerDocument>('Customer', customerSchema);
