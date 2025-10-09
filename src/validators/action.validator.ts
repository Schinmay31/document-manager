import { body, query } from "express-validator";

export const runActionValidator = [
  body("scope").isString().notEmpty().withMessage("scope is required."),
  body("messages").isArray().withMessage("messages must be an array."),
  body("actions").isArray().withMessage("actions must be an array."),
];

export const usageQueryValidator = [
  query("year").optional().isInt(),
  query("month").optional().isInt(),
];
