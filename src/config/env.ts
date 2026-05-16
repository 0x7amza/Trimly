import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file before validation
dotenv.config();

/**
 * Environment variable schema — validates and types all required config.
 * The server will fail fast on startup if any variable is missing or invalid.
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // MongoDB
  MONGODB_URI: z.string().url().startsWith('mongodb'),

  // Clerk (B2B auth)
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),

  // JWT (B2C auth)
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_MONTHLY_PRICE_ID: z.string().min(1),
  STRIPE_YEARLY_PRICE_ID: z.string().min(1),
  STRIPE_EXTRA_BARBER_PRICE_ID: z.string().min(1),

  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),   // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validated configuration object.
 * Throws a descriptive error at startup if any env var is invalid.
 */
function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const config = validateEnv();
