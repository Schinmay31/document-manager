// controllers/task.controller.ts
import { TaskModel } from "../models";
import mongoose from "mongoose";

class TaskController {
  // Create task
  static async createTask(data: {
    userId: string;
    source: string;
    classification: "official" | "ad";
    status?: "pending" | "completed" | "failed";
    channel?: "email" | "url" | null;
    target?: string | null;
    metadata?: Record<string, any>;
  }) {
    return await TaskModel.create(data);
  }

  // Find task by ID
  static async findTaskById(taskId: string) {
    return await TaskModel.findById(taskId).lean();
  }

  // Find tasks by user
  static async findTasksByUser(userId: string, filters: any = {}) {
    const query: any = { userId };

    if (filters.status) query.status = filters.status;
    if (filters.classification) query.classification = filters.classification;

    return await TaskModel.find(query).sort({ createdAt: -1 }).lean();
  }

  // Update task status
  static async updateTaskStatus(
    taskId: string,
    status: "pending" | "completed" | "failed"
  ) {
    return await TaskModel.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    ).lean();
  }

  // Count tasks by source for today (rate limiting)
  static async countTasksBySourceToday(userId: string, source: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await TaskModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      source,
      createdAt: { $gte: today },
    });
  }

  // Get today's tasks count
  static async countTasksToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await TaskModel.countDocuments({
      createdAt: { $gte: today },
    });
  }

  // Get all tasks (admin)
  static async findAllTasks(filters: any = {}) {
    const query: any = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.status) query.status = filters.status;
    if (filters.classification) query.classification = filters.classification;

    return await TaskModel.find(query).sort({ createdAt: -1 }).lean();
  }
}

export default TaskController;