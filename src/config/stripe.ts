import Stripe from 'stripe';
import { config } from './env';

/**
 * Stripe client singleton.
 * Initialized once at startup with the validated secret key.
 */
export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});
