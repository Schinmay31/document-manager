// routes/tags.routes.ts
import express, { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import TagsService from "../services/tag.service";

const tagsRoutes = express.Router();


// Create tag
tagsRoutes.post(
  "/tags",
  asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const { name } = req.body;

    const tag = await TagsService.createTag({ name, userId });

    res.status(201).json({ success: true, data: tag });
  })
);

// List all tags
tagsRoutes.get(
  "/tags",
  asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const userRole = req.user.role;

    const tags = await TagsService.listTags(userId, userRole);

    res.json({ success: true, data: tags });
  })
);

// Get single tag
tagsRoutes.get(
  "/tags/:id",
  asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { id } = req.params;

    const tag = await TagsService.getTag(id, userId, userRole);

    res.json({ success: true, data: tag });
  })
);

// Update tag
tagsRoutes.put(
  "/tags/:id",
  asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { id } = req.params;
    const updates = req.body;

    const tag = await TagsService.updateTag(id, userId, userRole, updates);

    res.json({ success: true, data: tag });
  })
);

// Delete tag
tagsRoutes.delete(
  "/tags/:id",
  asyncHandler(async (req: any, res: Response) => {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { id } = req.params;

    const result = await TagsService.deleteTag(id, userId, userRole);

    res.json({ success: true, data: result });
  })
);

export default tagsRoutes;