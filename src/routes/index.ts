import { Router, Request, Response, NextFunction } from "express";
import { errorHandler } from "../middleware/errorHandler.middleware";
import authRoutes from "./auth.routes";
import docsRoutes from "./document.routes";
import actionsRoutes from "./action.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/docs", docsRoutes);
router.use("/actions", actionsRoutes);


router.use(errorHandler);

export { router };
