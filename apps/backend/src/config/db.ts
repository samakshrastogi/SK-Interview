import mongoose from 'mongoose';
import Redis from 'ioredis';
import { logger } from './logger';

export const connectMongoDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sk_careerhub';

  try {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    await mongoose.connect(mongoUri);
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

const redisUri = process.env.REDIS_URI || 'redis://localhost:6379';
export const redisClient = new Redis(redisUri, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('error', (err) => {
  logger.error(`Redis connection error: ${err}`);
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (redisClient.status === 'wait') {
      await redisClient.connect();
    }
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    // Don't crash immediately, allow retry connection
  }
};
