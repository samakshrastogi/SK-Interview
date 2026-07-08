import mongoose, { Schema, Document } from 'mongoose';

export interface IOTPDocument extends Document {
  email: string;
  otp: string;
  type: 'verify-email' | 'reset-password';
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTPDocument>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['verify-email', 'reset-password'],
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index
  },
}, {
  timestamps: true,
});

export const OTP = mongoose.model<IOTPDocument>('OTP', OTPSchema);
