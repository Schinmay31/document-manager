// routes/tasks.routes.ts
import express, { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import OCRService from "../services/ocr.service";
import { listTasksValidator, updateTaskStatusValidator } from "../validators/task.validator";
import validateRequest from "../middleware/validate.middleware";

const tasksRoutes = express.Router();

// Get tasks
tasksRoutes.get(
  "/",
  listTasksValidator,
  validateRequest,
  asyncHandler(async (req: any, res: Response) => {
    const userId = res.locals["userData"].id;
    const userRole = res.locals["userData"].role;
    const filters = req.query;

    const tasks = await OCRService.getTasks(userId, userRole, filters);

    res.json({ success: true, data: tasks });
  })
);

// Update task status
tasksRoutes.put(
  "/tasks/:id",
  updateTaskStatusValidator,
  validateRequest,
  asyncHandler(async (req: any, res: Response) => {
    const userId = res.locals["userData"].id;
    const userRole = res.locals["userData"].role;
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: pending, completed, or failed",
      });
    }

    const task = await OCRService.updateTaskStatus(
      id,
      userId,
      userRole,
      status
    );

    res.json({ success: true, data: task });
  })
);

export default tasksRoutes;