// controllers/audit.controller.ts
import { AuditLogModel } from "../models";

class AuditController {
  // Create audit log
  static async createAuditLog(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, any>;
  }) {
    return await AuditLogModel.create({
      at: new Date(),
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata || {},
    });
  }
  // Find audit logs by user
  static async findByUser(userId: string, limit: number = 100) {
    return await AuditLogModel.find({ userId }).sort({ at: -1 }).limit(limit).lean();
  }

  // Find audit logs by action
  static async findByAction(action: string, limit: number = 100) {
    return await AuditLogModel.find({ action }).sort({ at: -1 }).limit(limit).lean();
  }

  // Find audit logs by entity
  static async findByEntity(entityType: string, entityId: string) {
    return await AuditLogModel.find({ entityType, entityId }).sort({ at: -1 }).lean();
  }

  // Find all audit logs (admin only)
  static async findAll(filters: any = {}, limit: number = 100, skip: number = 0) {
    const query: any = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.startDate || filters.endDate) {
      query.at = {};
      if (filters.startDate) query.at.$gte = new Date(filters.startDate);
      if (filters.endDate) query.at.$lte = new Date(filters.endDate);
    }

    return await AuditLogModel.find(query)
      .sort({ at: -1 })
      .limit(limit)
      .skip(skip)
      .populate("userId", "email role")
      .lean();
  }

  // Count audit logs
  static async countLogs(filters: any = {}) {
    const query: any = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.startDate || filters.endDate) {
      query.at = {};
      if (filters.startDate) query.at.$gte = new Date(filters.startDate);
      if (filters.endDate) query.at.$lte = new Date(filters.endDate);
    }

    return await AuditLogModel.countDocuments(query);
  }

  // Get logs for today
  static async findToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await AuditLogModel.find({
      at: { $gte: today },
    })
      .sort({ at: -1 })
      .lean();
  }

  // Delete old logs (cleanup)
  static async deleteOlderThan(days: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await AuditLogModel.deleteMany({
      at: { $lt: cutoffDate },
    });
  }
}

export default AuditController;