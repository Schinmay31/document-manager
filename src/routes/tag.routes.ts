// routes/tags.routes.ts
import express, { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import TagsService from "../services/tag.service";
import { createTagValidator, idParamValidator } from "../validators/tag.validator";
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
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const { name } = req.body;

    const tag = await TagsService.createTag({ name, userId });

    res.status(201).json({ success: true, data: tag });
  })
);

// List all tags
tagsRoutes.get(
  "/tags",
  requirePermission(PERMISSIONS.TAGS.READ_ANY),
  asyncHandler(async (req: any, res: Response) => {
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;

    const tags = await TagsService.listTags(userId, userRole);

    res.json({ success: true, data: tags });
  })
);

// Get single tag
tagsRoutes.get(
  "/tags/:id",
  idParamValidator,
  validateRequest,
  requirePermission(PERMISSIONS.TAGS.READ_OWN, {
    resourceOwnerPath: "params.id",
  }),
  asyncHandler(async (req: any, res: Response) => {
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const { id } = req.params;

    const tag = await TagsService.getTag(id, userId, userRole);

    res.json({ success: true, data: tag });
  })
);

// Update tag
tagsRoutes.put(
  "/tags/:id",
  idParamValidator,
  validateRequest,
  requirePermission(PERMISSIONS.TAGS.UPDATE_OWN, {
    resourceOwnerPath: "params.id",
  }),
  asyncHandler(async (req: any, res: Response) => {
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const { id } = req.params;
    const updates = req.body;

    const tag = await TagsService.updateTag(id, userId, userRole, updates);

    res.json({ success: true, data: tag });
  })
);

// Delete tag
tagsRoutes.delete(
  "/tags/:id",
  idParamValidator,
  validateRequest,
  requirePermission(PERMISSIONS.TAGS.DELETE_OWN, {
    resourceOwnerPath: "params.id",
  }),
  asyncHandler(async (req: any, res: Response) => {
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const { id } = req.params;

    const result = await TagsService.deleteTag(id, userId, userRole);

    res.json({ success: true, data: result });
  })
);

export default tagsRoutes;