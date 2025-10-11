// services/audit.service.ts
import AuditController from "../controllers/audit.controller";
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../utils/master-constants";

class AuditService {
  // Log an action (fire and forget - async but don't wait)
  async log(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, any>;
  }) {
    try {
      // Fire and forget - don't block the main request
      await AuditController.createAuditLog(data);
    } catch (error) {
      // Don't throw error, just log it
      console.error("Audit log failed:", error);
    }
  }

  // Get audit logs (admin or own logs)
  async getLogs(
    requestingUserId: string,
    requestingUserRole: string,
    filters: {
      userId?: string;
      action?: string;
      entityType?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    // Non-admin can only see their own logs
    if (requestingUserRole !== "admin") {
      filters.userId = requestingUserId;
    }

    const logs = await AuditController.findAll(filters, limit, skip);
    const total = await AuditController.countLogs(filters);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get user's activity
  async getUserActivity(userId: string, requestingUserId: string, requestingUserRole: string) {
    // Check if user can access these logs
    if (requestingUserRole !== "admin" && userId !== requestingUserId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access denied");
    }

    const logs = await AuditController.findByUser(userId);
    return logs;
  }

  // Get entity history
  async getEntityHistory(entityType: string, entityId: string) {
    const logs = await AuditController.findByEntity(entityType, entityId);
    return logs;
  }

  // Get today's activity summary
  async getTodaysSummary() {
    const logs = await AuditController.findToday();

    // Group by action
    const summary: Record<string, number> = {};
    logs.forEach((log) => {
      summary[log.action] = (summary[log.action] || 0) + 1;
    });

    return {
      total: logs.length,
      breakdown: summary,
      logs: logs.slice(0, 10), // Recent 10
    };
  }

  // Cleanup old logs (run as a scheduled job)
  async cleanupOldLogs(daysToKeep: number = 90) {
    const result = await AuditController.deleteOlderThan(daysToKeep);
    return {
      message: `Deleted logs older than ${daysToKeep} days`,
      deletedCount: result.deletedCount,
    };
  }
}

export default new AuditService();