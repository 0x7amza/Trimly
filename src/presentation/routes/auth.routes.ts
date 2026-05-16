import { Router } from 'express';
import { AuthController } from '@presentation/controllers/AuthController';
import { validate } from '@presentation/middlewares/validate';
import { authLimiter } from '@presentation/middlewares/rateLimiter';
import {
  sendOtpSchema,
  verifyOtpSchema,
  registerCustomerSchema,
  loginCustomerSchema,
} from '@presentation/validators/auth.validators';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  // OTP flow
  router.post(
    '/customer/send-otp',
    authLimiter,
    validate(sendOtpSchema),
    controller.sendOtp,
  );

  router.post(
    '/customer/verify-otp',
    authLimiter,
    validate(verifyOtpSchema),
    controller.verifyOtp,
  );

  // Email/Password flow
  router.post(
    '/customer/register',
    authLimiter,
    validate(registerCustomerSchema),
    controller.register,
  );

  router.post(
    '/customer/login',
    authLimiter,
    validate(loginCustomerSchema),
    controller.login,
  );

  return router;
}
