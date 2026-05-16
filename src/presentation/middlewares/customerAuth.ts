import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@shared/utils/jwt';
import { UnauthorizedError } from '@shared/errors/AppError';

/**
 * Custom JWT authentication middleware for customer (B2C) routes.
 * Extracts the Bearer token, verifies it, and attaches customerId to the request.
 */
export function requireCustomerAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    req.customerId = payload.customerId;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}
