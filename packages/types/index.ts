export type UserRole = 'admin' | 'mentor' | 'user' | 'moderator';

export interface IUserProfile {
  age?: number;
  qualification?: string;
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  gender?: 'Male' | 'Female' | 'Other';
  experienceYears?: number;
  state?: string;
  isPWD?: boolean;
  sportsQuota?: boolean;
  nccCertificate?: 'None' | 'A' | 'B' | 'C';
  annualIncome?: number;
  languages?: string[];
  typingSpeed?: number; // WPM
  hasComputerCertificate?: boolean;
  drivingLicense?: 'None' | 'Two-Wheeler' | 'Four-Wheeler' | 'Heavy-Vehicle' | 'Both';
  skills?: string[];
  resumeUrl?: string;
  resumeFileName?: string;
}

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isEmailVerified: boolean;
  profileCompleted: boolean;
  avatar?: string;
  profile?: IUserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
}
