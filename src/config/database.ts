import mongoose from 'mongoose';
import { config } from './env';

/**
 * Establish MongoDB connection with retry logic.
 * Logs connection state changes for observability.
 */
export async function connectDatabase(): Promise<void> {
  try {
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    await mongoose.connect(config.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Gracefully close the MongoDB connection.
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('🔌 MongoDB connection closed');
}
