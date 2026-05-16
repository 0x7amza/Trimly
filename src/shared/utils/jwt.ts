import jwt from 'jsonwebtoken';
import { config } from '@config/env';

export interface JwtPayload {
  customerId: string;
  phone?: string;
  email?: string;
}

/**
 * Sign a JWT token for customer authentication.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as string & jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verify and decode a JWT token.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
}
