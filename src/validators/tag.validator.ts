import { body, param } from "express-validator";

export const createTagValidator = [
  body("name").isString().notEmpty().withMessage("Tag name is required."),
];

export const idParamValidator = [
  param("id").isString().notEmpty().withMessage("id is required."),
];
