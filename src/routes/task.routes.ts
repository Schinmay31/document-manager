// routes/tasks.routes.ts
import express, { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import OCRService from "../services/ocr.service";
import { listTasksValidator } from "../validators/task.validator";
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

// update task status. will implmenent in future

export default tasksRoutes;