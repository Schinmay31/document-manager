import { Router, Request, Response, NextFunction } from "express";
import { errorHandler } from "../middleware/errorHandler.middleware";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use(errorHandler);

export { router };
