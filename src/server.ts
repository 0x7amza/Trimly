import { config } from '@config/env';
import { connectDatabase, disconnectDatabase } from '@config/database';
import { createApp } from './app';

/**
 * Server entry point.
 * Connects to MongoDB, starts the Express server, and handles graceful shutdown.
 */
async function bootstrap(): Promise<void> {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Create Express app
    const app = createApp();

    // 3. Start the server
    const server = app.listen(config.PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   🪒  Trimly API Server                      ║
  ║                                              ║
  ║   Environment : ${config.NODE_ENV.padEnd(27)}║
  ║   Port        : ${String(config.PORT).padEnd(27)}║
  ║   Health      : http://localhost:${config.PORT}/api/v1/health  ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
      `);
    });

    // 4. Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n⚡ ${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('🛑 HTTP server closed');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
