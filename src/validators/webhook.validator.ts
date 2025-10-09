import { body } from "express-validator";

export const ocrWebhookValidator = [
  body("source").isString().notEmpty().withMessage("source is required."),
  body("imageId").isString().notEmpty().withMessage("imageId is required."),
  body("text").isString().notEmpty().withMessage("text is required."),
  body("meta").optional(),
];
