import { z } from 'zod';

export const createShopSchema = {
  body: z.object({
    name: z.string().min(1, 'Shop name is required'),
  }),
};

export const addBarberSchema = {
  body: z.object({
    barberName: z.string().min(1, 'Barber name is required'),
    barberEmail: z.string().email('Invalid email address'),
    barberPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
};

export const subscribeSchema = {
  body: z.object({
    plan: z.enum(['MONTHLY', 'YEARLY']),
  }),
};

export const getShopBySlugSchema = {
  params: z.object({
    slug: z.string().min(1),
  }),
};
