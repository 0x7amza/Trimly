import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { UnauthorizedError, ForbiddenError } from '@shared/errors/AppError';
import { MongoBarberRepository } from '@infrastructure/database/repositories/MongoBarberRepository';
import { IBarber } from '@domain/entities/Barber';

/**
 * Extend Express Request to include barber auth info.
 */
declare global {
  namespace Express {
    interface Request {
      barberClerkId?: string;
      barber?: IBarber;
      customerId?: string;
    }
  }
}

const barberRepo = new MongoBarberRepository();

/**
 * Clerk authentication middleware for barber (B2B) routes.
 * Extracts the userId from the Clerk session, fetches the barber,
 * and attaches both to the request.
 */
export async function requireBarberAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = getAuth(req);

    if (!auth?.userId) {
      throw new UnauthorizedError('Barber authentication required');
    }

    const barber = await barberRepo.findByClerkId(auth.userId);

    req.barberClerkId = auth.userId;
    if (barber) {
      req.barber = barber;
    }
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired session'));
    }
  }
}

/**
 * Middleware to restrict access to shop owners.
 * Must be used AFTER requireBarberAuth.
 */
export function requireOwner(req: Request, _res: Response, next: NextFunction): void {
  if (!req.barber) {
    return next(new UnauthorizedError('Barber profile not found'));
  }

  if (req.barber.role !== 'OWNER') {
    return next(new ForbiddenError('Only shop owners can perform this action'));
  }

  next();
}
