import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { HandleStripeWebhookUseCase } from '@application/use-cases/payment/HandleStripeWebhookUseCase';

export class PaymentController {
  constructor(private webhookUseCase: HandleStripeWebhookUseCase) {}

  /**
   * Stripe Webhook endpoint.
   * CRITICAL: This route must use express.raw() — NOT express.json().
   * The raw body is required for signature verification.
   */
  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      res.status(400).json({ success: false, error: 'Missing stripe-signature header' });
      return;
    }

    await this.webhookUseCase.execute(req.body, signature);

    // Always return 200 quickly to acknowledge receipt
    res.status(200).json({ received: true });
  });
}
