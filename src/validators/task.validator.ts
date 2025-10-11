import { query } from "express-validator";

export const listTasksValidator = [
  query("status").optional().isString().withMessage("status must be a string"),
];
