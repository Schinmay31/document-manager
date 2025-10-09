import { body, query, param } from "express-validator";

export const listTasksValidator = [query("status").optional().isString().withMessage("status must be a string")];

export const updateTaskStatusValidator = [
  param("id").isString().notEmpty().withMessage("Task id is required."),
  body("status")
    .isIn(["pending", "completed", "failed"])
    .withMessage("status must be one of: pending, completed, failed"),
];
