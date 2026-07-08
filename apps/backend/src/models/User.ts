import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IUserProfile } from '@sk-careerhub/types';

export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  passwordHash: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserProfileSchema = new Schema<IUserProfile>({
  age: { type: Number },
  qualification: { type: String },
  category: { 
    type: String, 
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS'] 
  },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'] 
  },
  experienceYears: { type: Number, default: 0 },
  state: { type: String },
  isPWD: { type: Boolean, default: false },
  sportsQuota: { type: Boolean, default: false },
  nccCertificate: { 
    type: String, 
    enum: ['None', 'A', 'B', 'C'], 
    default: 'None' 
  },
  annualIncome: { type: Number },
  languages: [{ type: String }],
  typingSpeed: { type: Number },
  hasComputerCertificate: { type: Boolean, default: false },
  drivingLicense: { 
    type: String, 
    enum: ['None', 'Two-Wheeler', 'Four-Wheeler', 'Heavy-Vehicle', 'Both'], 
    default: 'None' 
  },
  skills: [{ type: String }],
  resumeUrl: { type: String },
  resumeFileName: { type: String },
}, { _id: false });

const UserSchema = new Schema<IUserDocument>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    index: true
  },
  fullName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'mentor', 'user', 'moderator'], 
    default: 'user' 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  profileCompleted: { 
    type: Boolean, 
    default: false 
  },
  avatar: {
    type: String,
    default: 'avatar1'
  },
  profile: { 
    type: UserProfileSchema,
    default: () => ({})
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      return ret;
    }
  }
});

// Pre-save hashing for password
UserSchema.pre('save', async function(this: any, next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function(this: any, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
