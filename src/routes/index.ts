import { Router } from "express";
import { errorHandler } from "../middleware/errorHandler.middleware";
import authRoutes from "./auth.routes";
import docsRoutes from "./document.routes";
import actionsRoutes from "./action.routes";
import tasksRoutes from "./task.routes";
import webhooksRoutes from "./webhook.routes";
import metricsRoutes from "./metrics.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/docs", docsRoutes);
router.use("/actions", actionsRoutes);
router.use("/tasks", tasksRoutes);
router.use("/webhook", webhooksRoutes);
router.use("/metrics", metricsRoutes);

router.use(errorHandler);

export { router };
