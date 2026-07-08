import { AuditLog, IAuditLogDocument } from '../models/AuditLog';

export class AuditLogRepository {
  async log(data: {
    userId?: string;
    userEmail?: string;
    action: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<IAuditLogDocument> {
    const logEntry = new AuditLog(data);
    return logEntry.save();
  }

  async getLogsByUser(userId: string): Promise<IAuditLogDocument[]> {
    return AuditLog.find({ userId }).sort({ timestamp: -1 }).limit(100);
  }
}
export const auditLogRepository = new AuditLogRepository();
