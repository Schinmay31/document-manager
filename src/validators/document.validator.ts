import { body, query, param } from "express-validator";

export const uploadDocumentValidator = [
  body("primaryTag").notEmpty().withMessage("Primary tag is required."),
  body("secondaryTags")
    .optional()
    .isArray()
    .withMessage("Secondary tags must be an array."),
];

export const searchDocumentsValidator = [
  query("q").optional().isString(),
  query("scope").optional().isIn(["folder", "files"]),
  query("ids").optional(),
];

export const idParamValidator = [param("id").isString().notEmpty().withMessage("id is required")];
