import express from "express";
import { asyncHandler } from "../utils/asyncHandler";
import MetricsService from "../services/metrics.service";
import requirePermission from "../middleware/rbac.middleware";
import { PERMISSIONS } from "../constants/permissions.constants";

const metricsRoutes = express.Router();

metricsRoutes.get(
  "/",
  requirePermission(PERMISSIONS.METRICS.READ),
  asyncHandler(async (req: any, res: any) => {
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;

    const docs_total = await MetricsService.docsTotal(userId, userRole);
    const folders_total = await MetricsService.foldersTotal(userId, userRole);
    const actions_month = await MetricsService.actionsLast30Days(userId, userRole);
    const tasks_today = await MetricsService.tasksToday(userId, userRole);

    res.json({ success: true, data: { docs_total, folders_total, actions_month, tasks_today } });
  })
);

export default metricsRoutes;
