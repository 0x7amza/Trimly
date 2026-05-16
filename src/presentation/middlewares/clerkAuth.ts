import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { UnauthorizedError } from '@shared/errors/AppError';

/**
 * Extend Express Request to include barber auth info.
 */
declare global {
  namespace Express {
    interface Request {
      barberClerkId?: string;
      customerId?: string;
    }
  }
}

/**
 * Clerk authentication middleware for barber (B2B) routes.
 * Extracts the userId from the Clerk session and attaches it to req.barberClerkId.
 *
 * Note: clerkMiddleware() must be applied globally in app.ts for this to work.
 */
export function requireBarberAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const auth = getAuth(req);

    if (!auth?.userId) {
      throw new UnauthorizedError('Barber authentication required');
    }

    req.barberClerkId = auth.userId;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired session'));
    }
  }
}
