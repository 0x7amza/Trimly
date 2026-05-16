import { Router } from 'express';
import express from 'express';
import { PaymentController } from '@presentation/controllers/PaymentController';

/**
 * Payment routes.
 * CRITICAL: The webhook route uses express.raw() for Stripe signature verification.
 * This route MUST NOT have express.json() applied to it.
 */
export function createPaymentRoutes(controller: PaymentController): Router {
  const router = Router();

  router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    controller.handleWebhook,
  );

  return router;
}
