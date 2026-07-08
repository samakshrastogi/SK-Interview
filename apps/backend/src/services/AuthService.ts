import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository, UserRepository } from '../repositories/UserRepository';
import { tokenRepository, TokenRepository } from '../repositories/TokenRepository';
import { otpRepository, OTPRepository } from '../repositories/OTPRepository';
import { emailService, EmailService } from './EmailService';
import { IUserProfile, IUser } from '@sk-careerhub/types';
import { IUserDocument } from '../models/User';
import { AppError } from '../middleware/error';

export class AuthService {
  private userRepo: UserRepository = userRepository;
  private tokenRepo: TokenRepository = tokenRepository;
  private otpRepo: OTPRepository = otpRepository;
  private emailServ: EmailService = emailService;

  private generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits OTP
  }

  async generateTokens(user: IUserDocument): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET || 'access_secret',
      { expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any }
    );

    const refreshToken = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      { expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any }
    );

    // Save refresh token to database
    const expiryDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    await this.tokenRepo.create(user._id.toString(), refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }

  async register(data: { email: string; fullName: string; passwordHash: string; role?: 'user' | 'mentor' }): Promise<IUserDocument> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error('Email is already registered');
    }

    const user = await this.userRepo.create({
      email: data.email,
      fullName: data.fullName,
      passwordHash: data.passwordHash,
      role: data.role || 'user',
      isEmailVerified: false,
      profileCompleted: false,
    });

    // Generate & send OTP code
    const otpCode = this.generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await this.otpRepo.create(user.email, otpCode, 'verify-email', expiresAt);
    await this.emailServ.sendOTPEmail(user.email, otpCode, 'verify-email');

    return user;
  }

  async verifyOTP(email: string, otp: string, type: 'verify-email' | 'reset-password'): Promise<boolean> {
    const otpDoc = await this.otpRepo.findOTP(email, otp, type);
    if (!otpDoc) {
      return false;
    }

    // Delete OTP after verification to prevent reuse
    await this.otpRepo.deleteOTP(otpDoc._id.toString());

    if (type === 'verify-email') {
      const user = await this.userRepo.findByEmail(email);
      if (user) {
        user.isEmailVerified = true;
        await user.save();
      }
    }

    return true;
  }

  async login(email: string, passwordSecret: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(passwordSecret);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      // Trigger new OTP verification email
      const otpCode = this.generateOTPCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await this.otpRepo.create(user.email, otpCode, 'verify-email', expiresAt);
      await this.emailServ.sendOTPEmail(user.email, otpCode, 'verify-email');
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: user.toJSON() as unknown as IUser,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    // Validate token exists in Database
    const tokenDoc = await this.tokenRepo.findByToken(refreshToken);
    if (!tokenDoc) {
      throw new AppError(401, 'Invalid refresh token');
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret') as { sub: string };
      const user = await this.userRepo.findById(decoded.sub);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Delete the used token
      await this.tokenRepo.deleteByToken(refreshToken);

      // Generate a new token pair (Token Rotation)
      const tokens = await this.generateTokens(user);
      return {
        accessToken: tokens.accessToken,
        newRefreshToken: tokens.refreshToken,
      };
    } catch (err) {
      await this.tokenRepo.deleteByToken(refreshToken);
      throw new AppError(401, 'Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenRepo.deleteByToken(refreshToken);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      // Prevent user enumeration by silent success, but logs it
      return;
    }

    const otpCode = this.generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.otpRepo.create(email, otpCode, 'reset-password', expiresAt);
    await this.emailServ.sendOTPEmail(email, otpCode, 'reset-password');
  }

  async resetPassword(email: string, otp: string, passwordSecret: string): Promise<boolean> {
    const valid = await this.verifyOTP(email, otp, 'reset-password');
    if (!valid) {
      return false;
    }

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return false;
    }

    user.passwordHash = passwordSecret; // This triggers user Schema pre-save bcrypt hash
    await user.save();

    // Revoke all existing sessions
    await this.tokenRepo.deleteAllForUser(user._id.toString());

    return true;
  }

  async completeProfile(userId: string, profileData: IUserProfile): Promise<IUser> {
    const user = await this.userRepo.updateProfile(userId, profileData);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toJSON() as unknown as IUser;
  }
}
export const authService = new AuthService();
