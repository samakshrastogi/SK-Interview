import mongoose, { Schema, Document } from 'mongoose';
import { IAuditLog } from '@sk-careerhub/types';

export interface IAuditLogDocument extends Omit<IAuditLog, 'id'>, Document {}

const AuditLogSchema = new Schema<IAuditLogDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  userEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  details: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false },
});

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
