import { Router, Request, Response, NextFunction } from "express";
import { errorHandler } from "../middleware/errorHandler.middleware";

const router = Router();

// contact routes
// router.use("/",contactRoutes)

router.use(errorHandler);

export { router };
