// routes/actions.routes.ts
import express, { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ActionsService from "../services/actions.service";
import { runActionValidator, usageQueryValidator } from "../validators/action.validator";
import validateRequest from "../middleware/validate.middleware";

const actionsRoutes = express.Router();


// Run scoped action
actionsRoutes.post(
  "/run",
  runActionValidator,
  validateRequest,
  asyncHandler(async (req: any, res: Response) => {
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const { scope, messages, actions } = req.body;

    const result = await ActionsService.runAction({
      userId,
      userRole,
      scope,
      messages,
      actions,
    });

    res.status(200).json({ success: true, data: result });
  })
);

// Get monthly usage
actionsRoutes.get(
  "/usage/month",
  usageQueryValidator,
  validateRequest,
  asyncHandler(async (req: any, res: Response) => {
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const { year, month } = req.query;

    const usage = await ActionsService.getMonthlyUsage(
      userId,
      userRole,
      year ? parseInt(year as string) : undefined,
      month ? parseInt(month as string) : undefined
    );

    res.json({ success: true, data: usage });
  })
);

export default actionsRoutes;