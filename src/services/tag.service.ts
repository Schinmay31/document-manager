// services/tags.service.ts
import { AUDIT_ACTIONS } from "../constants/document.constant";
import TagsController from "../controllers/tag.controller";
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../utils/master-constants";
import AuditService from "./audit.service";

class TagsService {
  // Create new tag
  async createTag(payload: { name: string; userId: string }) {
    const { name, userId } = payload;

    if (!name || name.trim().length === 0) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Tag name is required");
    }

    // Check if tag already exists for this user
    const existing = await TagsController.findTagByName(name, userId);

    if (existing) {
      // Return existing tag instead of error (idempotent)
      return existing;
    }

    // Create new tag
    const tag = await TagsController.createTag({
      name: name.toLowerCase().trim(),
      ownerId: userId,
    });

    // Audit log
    await AuditService.log({
      userId,
      action: AUDIT_ACTIONS.TAG_CREATE,
      entityType: "Tag",
      entityId: String(tag._id),
      metadata: { name: tag.name },
    });

    return tag;
  }

}

export default new TagsService();