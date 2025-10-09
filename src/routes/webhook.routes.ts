// routes/webhooks.routes.ts
import express, { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import OCRService from "../services/ocr.service";
import { ocrWebhookValidator } from "../validators/webhook.validator";
import validateRequest from "../middleware/validate.middleware";

const webhooksRoutes = express.Router();

// optical character recognition webhook
webhooksRoutes.post(
  "/ocr",
  ocrWebhookValidator,
  validateRequest,
  asyncHandler(async (req: any, res: Response) => {
    const userId = res.locals["userData"].id;
    const { source, imageId, text, meta } = req.body;

    const task = await OCRService.processOCR({ source, imageId, text, meta }, userId);

    res.status(201).json({ success: true, data: task });
  })
);

export default webhooksRoutes;