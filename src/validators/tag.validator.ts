import { body, param } from "express-validator";

export const createTagValidator = [
  body("name").isString().notEmpty().withMessage("Tag name is required."),
];

export const idParamValidator = [param("id").isMongoId().withMessage("id must be a valid Mongo ObjectId")];
