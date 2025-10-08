// routes/webhooks.routes.ts
import express, { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import OCRService from "../services/ocr.service";

const webhooksRoutes = express.Router();

// optical character recognition webhook
webhooksRoutes.post(
  "/ocr",
  asyncHandler(async (req: any, res: Response) => {
    const userId = res.locals["userData"].id;
    const { source, imageId, text, meta } = req.body;

    // Validate required fields
    if (!source || !imageId || !text) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: source, imageId, text",
      });
    }

    const task = await OCRService.processOCR(
      { source, imageId, text, meta },
      userId
    );

    res.status(201).json({ success: true, data: task });
  })
);

export default webhooksRoutes;