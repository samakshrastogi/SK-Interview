import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error';
import { UserRole } from '@sk-careerhub/types';
import { userRepository } from '../repositories/UserRepository';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError(401, 'Access denied. No token provided.'));
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_ACCESS_SECRET || 'access_secret';
    const decoded = jwt.verify(token, secret) as { sub: string; email: string; role: UserRole };

    // Set request user details
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(new AppError(401, 'Invalid or expired token.'));
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Unauthorized'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(403, 'Forbidden. You do not have permissions to perform this action.'));
      return;
    }

    next();
  };
};
