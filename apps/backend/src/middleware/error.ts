import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(err);

  // Zod Input Validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // AppError (Operational errors we threw)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.statusCode >= 500 ? 'error' : 'fail',
      message: err.message,
    });
    return;
  }

  // Fallback for general unhandled/internal exceptions
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    status: 'error',
    message: isProd ? 'Internal Server Error' : err.message,
  });
};
