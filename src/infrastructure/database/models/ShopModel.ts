import mongoose, { Schema, Document } from 'mongoose';
import { IShop, ISubscription } from '@domain/entities/Shop';

export interface IShopDocument extends Omit<IShop, 'id'>, Document {}

const subscriptionSchema = new Schema<ISubscription>(
  {
    plan: {
      type: String,
      enum: ['MONTHLY', 'YEARLY', 'NONE'],
      default: 'NONE',
    },
    status: {
      type: String,
      enum: ['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'],
      default: 'EXPIRED',
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    currentPeriodEnd: { type: Date },
    trialEndsAt: { type: Date },
    gracePeriodEndsAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { _id: false },
);

const shopSchema = new Schema<IShopDocument>(
  {
    ownerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    subscription: {
      type: subscriptionSchema,
      default: () => ({
        plan: 'NONE',
        status: 'EXPIRED',
      }),
    },
    maxBarbersIncluded: { type: Number, default: 5 },
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

// Index for Stripe customer lookup during webhooks
shopSchema.index({ 'subscription.stripeCustomerId': 1 });

export const ShopModel = mongoose.model<IShopDocument>('Shop', shopSchema);
