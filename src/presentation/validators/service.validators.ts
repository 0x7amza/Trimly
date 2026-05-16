import { z } from 'zod';

export const createServiceSchema = {
  body: z.object({
    name: z.string().min(1, 'Service name is required'),
    price: z.number().int().min(0, 'Price must be a positive integer (in pence)'),
    durationMinutes: z.number().int().min(5, 'Duration must be at least 5 minutes'),
  }),
};

export const updateServiceSchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    price: z.number().int().min(0).optional(),
    durationMinutes: z.number().int().min(5).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
};

export const getBarberServicesSchema = {
  params: z.object({
    clerkId: z.string().min(1),
  }),
};

export const deleteServiceSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
};
