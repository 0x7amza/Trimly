import { z } from 'zod';

const businessHoursItemSchema = z.object({
  day: z.number().min(0).max(6),
  open: z.string().regex(/^\d{2}:\d{2}$/, 'Must be in HH:mm format'),
  close: z.string().regex(/^\d{2}:\d{2}$/, 'Must be in HH:mm format'),
  isClosed: z.boolean(),
});

export const syncBarberSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
  }),
};

export const updateBarberSchema = {
  body: z.object({
    shopName: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    address: z.string().min(1).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url('Must be a valid URL').optional(),
    businessHours: z.array(businessHoursItemSchema).length(7).optional(),
  }),
};
