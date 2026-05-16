import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/errors/AppError';

/**
 * Global error handling middleware.
 * Must be the last middleware registered on the Express app.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Database validation failed',
      details: err.message,
    });
    return;
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Invalid resource ID',
    });
    return;
  }

  // Unexpected errors — log and send generic message
  console.error('❌ Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}
