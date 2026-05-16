import { z } from 'zod';

export const sendOtpSchema = {
  body: z.object({
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  }),
};

export const verifyOtpSchema = {
  body: z.object({
    phone: z.string().min(10),
    code: z.string().length(6, 'OTP must be 6 digits'),
  }),
};

export const registerCustomerSchema = {
  body: z.object({
    phone: z.string().min(10),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1).optional(),
  }),
};

export const loginCustomerSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or phone number is required'),
    password: z.string().min(1, 'Password is required'),
  }),
};
