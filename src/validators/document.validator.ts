import { body, query, param } from "express-validator";

export const uploadDocumentValidator = [
  body("primaryTag").notEmpty().withMessage("Primary tag is required."),
  body("secondaryTags")
    .optional()
    .custom((value) => {
      // Accept either an actual array or a string that is a JSON array
      if (Array.isArray(value)) return true;
      if (typeof value === "string") {
        // try parse as JSON array
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch (e) {
          // not JSON
          return false;
        }
      }
      return false;
    })
    .withMessage("Secondary tags must be an array or a JSON/CSV string."),
];

export const searchDocumentsValidator = [
  query("q").optional().isString(),
  query("scope").optional().isIn(["folder", "files"]),
  query("ids").optional(),
];

export const idParamValidator = [
  param("id").isMongoId().withMessage("id must be a valid Mongo ObjectId"),
];

export const tagParamValidator = [
  param("tag").isMongoId().withMessage("tag must be a valid Mongo ObjectId"),
];
