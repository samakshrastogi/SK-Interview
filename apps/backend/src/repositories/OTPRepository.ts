import { OTP, IOTPDocument } from '../models/OTP';

export class OTPRepository {
  async create(email: string, otp: string, type: 'verify-email' | 'reset-password', expiresAt: Date): Promise<IOTPDocument> {
    // Delete any existing OTP of same type for the email
    await OTP.deleteMany({ email: email.toLowerCase(), type });
    
    const otpDoc = new OTP({
      email: email.toLowerCase(),
      otp,
      type,
      expiresAt,
    });
    return otpDoc.save();
  }

  async findOTP(email: string, otp: string, type: 'verify-email' | 'reset-password'): Promise<IOTPDocument | null> {
    return OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type,
      expiresAt: { $gt: new Date() },
    });
  }

  async deleteOTP(id: string): Promise<any> {
    return OTP.findByIdAndDelete(id);
  }
}
export const otpRepository = new OTPRepository();
