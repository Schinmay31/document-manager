import { DocumentModel, DocumentTagModel, TaskModel } from "../models";
import AuditController from "../controllers/audit.controller";

class MetricsService {
  // Count documents visible to user (admin sees all)
  static async docsTotal(userId: string, userRole: string) {
    const query: any = {};
    if (userRole !== "admin") query.ownerId = userId;
    return await DocumentModel.countDocuments(query);
  }

  // Count folders (primary tags used) visible to user
  static async foldersTotal(userId: string, userRole: string) {
    // Count distinct primary tag ids from DocumentTagModel where isPrimary = true
    const match: any = { isPrimary: true };
    if (userRole !== "admin") match.ownerId = userId;

    const result = await DocumentTagModel.aggregate([
      { $match: match },
      { $group: { _id: "$tagId" } },
      { $count: "folders" },
    ]);

    return result[0] ? result[0].folders : 0;
  }

  // Count audit actions in the last 30 days (optionally scoped to user)
  static async actionsLast30Days(userId: string, userRole: string) {
    const start = new Date();
    start.setDate(start.getDate() - 30);

    const filters: any = { startDate: start.toISOString() };
    if (userRole !== "admin") filters.userId = userId;

    return await AuditController.countLogs(filters);
  }

  // Count tasks created today
  static async tasksToday(userId: string, userRole: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query: any = { createdAt: { $gte: today } };
    if (userRole !== "admin") query.ownerId = userId;

    return await TaskModel.countDocuments(query);
  }
}

export default MetricsService;
