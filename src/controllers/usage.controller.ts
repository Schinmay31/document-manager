// controllers/usage.controller.ts
import { UsageModel } from "../models";
import mongoose from "mongoose";

class UsageController {
  // Create usage record
  static async createUsage(data: {
    userId: string;
    action: string;
    credits: number;
    metadata?: Record<string, any>;
  }) {
    return await UsageModel.create(data);
  }

  // Get monthly usage by user
  static async getMonthlyUsage(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const result = await UsageModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: "$credits" },
          totalActions: { $sum: 1 },
        },
      },
    ]);

    return result[0] || { totalCredits: 0, totalActions: 0 };
  }

  // Get monthly usage for all users (admin)
  static async getAllUsersMonthlyUsage(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    return await UsageModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalCredits: { $sum: "$credits" },
          totalActions: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userId: "$_id",
          email: "$user.email",
          role: "$user.role",
          totalCredits: 1,
          totalActions: 1,
        },
      },
      { $sort: { totalCredits: -1 } },
    ]);
  }

  // Get total usage by user
  static async getTotalUsageByUser(userId: string) {
    const result = await UsageModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: "$credits" },
          totalActions: { $sum: 1 },
        },
      },
    ]);

    return result[0] || { totalCredits: 0, totalActions: 0 };
  }
}

export default UsageController;