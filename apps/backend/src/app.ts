import dotenv from 'dotenv';
import path from 'path';
// Load environment variables first, resolving absolute path relative to backend folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { connectMongoDB, connectRedis } from './config/db';
import { logger } from './config/logger';
import { errorHandler, AppError } from './middleware/error';
import authRoutes from './routes/auth.routes';
import examRoutes from './routes/exam.routes';
import { startCrawlerWorker, scheduleCrawlerJobs } from './services/CrawlerQueue';

const app = express();
const PORT = process.env.PORT || 4003;

// Security and utility Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom tiny Cookie Parser middleware to parse request cookies securely without extra package dependency
app.use((req: any, res: Response, next: NextFunction) => {
  const cookies: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie: string) => {
      const parts = cookie.split('=');
      const key = parts.shift()?.trim();
      if (key) {
        cookies[key] = decodeURIComponent(parts.join('='));
      }
    });
  }
  req.cookies = cookies;
  next();
});

// Configure CORS
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5476'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Morgan HTTP request logging streaming to Winston logger
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: morganStream }));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', limiter);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/exams', examRoutes);

// Fallback Route for non-matching endpoints
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server`));
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server and connect to DBs
const startServer = async () => {
  await connectMongoDB();
  await connectRedis();

  // Initialize BullMQ Worker and Cron repeaters
  startCrawlerWorker();
  await scheduleCrawlerJobs();

  app.listen(PORT, () => {
    logger.info(`🚀 SK CareerHub AI Backend server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer().catch((error) => {
  logger.error('Startup failed', error);
  process.exit(1);
});
