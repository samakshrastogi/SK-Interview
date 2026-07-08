import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters long'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['user', 'mentor']).default('user'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 characters'),
  type: z.enum(['verify-email', 'reset-password']),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const profileCompletionSchema = z.object({
  age: z.number().int().min(16).max(60),
  qualification: z.string().min(2, 'Qualification is required'),
  category: z.enum(['General', 'OBC', 'SC', 'ST', 'EWS']),
  gender: z.enum(['Male', 'Female', 'Other']),
  experienceYears: z.number().nonnegative().optional().default(0),
  state: z.string().min(2, 'State is required'),
  isPWD: z.boolean().optional().default(false),
  sportsQuota: z.boolean().optional().default(false),
  nccCertificate: z.enum(['None', 'A', 'B', 'C']).optional().default('None'),
  annualIncome: z.number().nonnegative().optional(),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  typingSpeed: z.number().nonnegative().optional().default(0),
  hasComputerCertificate: z.boolean().optional().default(false),
  drivingLicense: z.enum(['None', 'Two-Wheeler', 'Four-Wheeler', 'Heavy-Vehicle', 'Both']).optional().default('None'),
  skills: z.array(z.string()).optional().default([]),
  resumeUrl: z.string().url('Invalid resume URL').optional(),
  resumeFileName: z.string().optional(),
});
