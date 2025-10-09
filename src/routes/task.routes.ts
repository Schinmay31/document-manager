// routes/tasks.routes.ts
import express, { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import OCRService from "../services/ocr.service";
import { listTasksValidator, updateTaskStatusValidator } from "../validators/task.validator";
import validateRequest from "../middleware/validate.middleware";
import requirePermission from "../middleware/rbac.middleware";
import { PERMISSIONS } from "../constants/permissions.constants";

const tasksRoutes = express.Router();

// Get tasks
tasksRoutes.get(
  "/",
  listTasksValidator,
  validateRequest,
  requirePermission(PERMISSIONS.TASKS.READ_OWN),
  asyncHandler(async (req: any, res: Response) => {
    const userId = res.locals["userData"].id;
    const userRole = res.locals["userData"].role;
    const _filters = req.query;

    const tasks = await OCRService.getTasks(userId, userRole, _filters);

    res.json({ success: true, data: tasks });
    return;
  })
);

// Update task status
tasksRoutes.put(
  "/tasks/:id",
  updateTaskStatusValidator,
  validateRequest,
  requirePermission(PERMISSIONS.TASKS.UPDATE_OWN, {
    resourceOwnerPath: "params.id",
  }),
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

    const task = await OCRService.updateTaskStatus(id, userId, userRole, status);
    res.json({ success: true, data: task });
    return;
  })
);

export default tasksRoutes;