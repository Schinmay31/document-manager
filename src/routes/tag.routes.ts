// routes/tags.routes.ts
import express, { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import TagsService from "../services/tag.service";
import { createTagValidator } from "../validators/tag.validator";
import validateRequest from "../middleware/validate.middleware";
import requirePermission from "../middleware/rbac.middleware";
import { PERMISSIONS } from "../constants/permissions.constants";

const tagsRoutes = express.Router();

// Create tag
tagsRoutes.post(
  "/tags",
  createTagValidator,
  validateRequest,
  requirePermission(PERMISSIONS.TAGS.CREATE),
  asyncHandler(async (req: any, res: Response) => {
    const _userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const { name } = req.body;

    const tag = await TagsService.createTag({ name, userId });

    res.status(201).json({ success: true, data: tag });
  })
);
export default tagsRoutes;