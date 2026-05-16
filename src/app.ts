import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { generalLimiter } from '@presentation/middlewares/rateLimiter';
import { errorHandler } from '@presentation/middlewares/errorHandler';
import { createApiRouter } from '@presentation/routes/index';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '@presentation/docs/swagger';

/**
 * Create and configure the Express application.
 *
 * MIDDLEWARE ORDER IS CRITICAL:
 * 1. Security headers (Helmet)
 * 2. CORS
 * 3. Rate limiting
 * 4. Clerk middleware (provides auth state to all routes)
 * 5. JSON body parser (AFTER routes that need raw body — handled per-route)
 * 6. Routes
 * 7. 404 handler
 * 8. Global error handler
 */
export function createApp(): express.Application {
  const app = express();

  // ── Swagger API Documentation ──
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  // ── Security ──
  app.use(helmet());
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://trimly.com'] // Restrict in production
      : '*',
    credentials: true,
  }));
  app.use(generalLimiter);

  // ── Clerk middleware (provides auth state globally) ──
  app.use(clerkMiddleware());

  // ── Body parsers ──
  // Note: Stripe webhook route uses express.raw() defined in payment.routes.ts
  // so it must be configured per-route BEFORE this global JSON parser takes effect.
  // express.json() only applies to routes that don't already have a body parser.
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Health check (before API routes) ──
  app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  // ── API Routes ──
  app.use('/api/v1', createApiRouter());



  // ── 404 Handler ──
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  // ── Global Error Handler (must be last) ──
  app.use(errorHandler);

  return app;
}
