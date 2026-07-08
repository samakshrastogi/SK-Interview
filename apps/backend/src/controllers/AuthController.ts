import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { authService } from '../services/AuthService';
import { auditLogRepository } from '../repositories/AuditLogRepository';
import { AppError } from '../middleware/error';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileCompletionSchema,
} from '../validators/auth.validator';
import { userRepository } from '../repositories/UserRepository';

const COOKIE_NAME = 'refreshToken';
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_EXPIRY_MS,
  });
};

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const user = await authService.register({
        email: validated.email,
        fullName: validated.fullName,
        passwordHash: validated.password,
        role: validated.role,
      });

      await auditLogRepository.log({
        userId: user._id.toString(),
        userEmail: user.email,
        action: 'REGISTER',
        details: 'User registered successfully. Verification OTP dispatched.',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({
        status: 'success',
        message: 'Registration successful. Verification OTP sent to email.',
        data: {
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = verifyOtpSchema.parse(req.body);
      const success = await authService.verifyOTP(validated.email, validated.otp, validated.type);

      if (!success) {
        throw new AppError(400, 'Invalid or expired OTP');
      }

      await auditLogRepository.log({
        userEmail: validated.email,
        action: 'VERIFY_OTP',
        details: `OTP verified successfully for type ${validated.type}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        status: 'success',
        message: 'OTP verified successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      
      try {
        const { user, accessToken, refreshToken } = await authService.login(validated.email, validated.password);
        
        setRefreshCookie(res, refreshToken);
        
        await auditLogRepository.log({
          userId: user.id,
          userEmail: user.email,
          action: 'LOGIN',
          details: 'User logged in successfully.',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });

        res.status(200).json({
          status: 'success',
          data: {
            user,
            accessToken,
          },
        });
      } catch (error: any) {
        if (error.message === 'EMAIL_NOT_VERIFIED') {
          res.status(403).json({
            status: 'fail',
            code: 'EMAIL_NOT_VERIFIED',
            message: 'Email has not been verified yet. A new OTP code was sent.',
          });
          return;
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      if (!token) {
        throw new AppError(401, 'Refresh token missing');
      }

      const { accessToken, newRefreshToken } = await authService.refresh(token);
      
      setRefreshCookie(res, newRefreshToken);

      res.status(200).json({
        status: 'success',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      if (token) {
        await authService.logout(token);
      }

      res.clearCookie(COOKIE_NAME);
      
      if (req.user) {
        await auditLogRepository.log({
          userId: req.user.id,
          userEmail: req.user.email,
          action: 'LOGOUT',
          details: 'User logged out.',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      await authService.requestPasswordReset(validated.email);

      res.status(200).json({
        status: 'success',
        message: 'If the email exists, a password reset code has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      const success = await authService.resetPassword(validated.email, validated.otp, validated.newPassword);

      if (!success) {
        throw new AppError(400, 'Failed to reset password. OTP may be invalid or expired.');
      }

      res.status(200).json({
        status: 'success',
        message: 'Password reset successful. You may now login.',
      });
    } catch (error) {
      next(error);
    }
  }

  async completeProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const validated = profileCompletionSchema.parse(req.body);
      const user = await authService.completeProfile(req.user.id, validated);

      await auditLogRepository.log({
        userId: user.id,
        userEmail: user.email,
        action: 'COMPLETE_PROFILE',
        details: 'User profile completion details submitted.',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const user = await userRepository.findById(req.user.id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.status(200).json({
        status: 'success',
        data: {
          user: user.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
