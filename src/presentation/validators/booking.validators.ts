import { z } from 'zod';

export const getAvailabilitySchema = {
  params: z.object({
    clerkId: z.string().min(1),
  }),
  query: z.object({
    serviceId: z.string().min(1, 'serviceId is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  }),
};

export const createOnlineBookingSchema = {
  body: z.object({
    barberId: z.string().min(1),
    serviceId: z.string().min(1),
    startTime: z.string().datetime({ message: 'startTime must be a valid ISO 8601 datetime' }),
  }),
};

export const createManualBookingSchema = {
  body: z.object({
    serviceId: z.string().min(1),
    startTime: z.string().datetime({ message: 'startTime must be a valid ISO 8601 datetime' }),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    notes: z.string().optional(),
  }),
};

export const updateBookingStatusSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
  }),
};
