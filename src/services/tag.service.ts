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

  // Get all tags for user
  async listTags(userId: string, userRole: string) {
    if (userRole === "admin") {
      return await TagsController.findAllTags();
    }

    return await TagsController.findTagsByOwner(userId);
  }

  // Get single tag
  async getTag(tagId: string, userId: string, userRole: string) {
    const tag = await TagsController.findTagById(tagId);

    if (!tag) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Tag not found");
    }

    // Check ownership (admin can access all)
    if (userRole !== "admin" && tag.ownerId.toString() !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access denied");
    }

    return tag;
  }

  // Update tag
  async updateTag(
    tagId: string,
    userId: string,
    userRole: string,
    updates: { name?: string }
  ) {
    const tag = await TagsController.findTagById(tagId);

    if (!tag) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Tag not found");
    }

    // Check ownership
    if (userRole !== "admin" && tag.ownerId.toString() !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access denied");
    }

    // Normalize name if updating
    if (updates.name) {
      updates.name = updates.name.toLowerCase().trim();

      // Check if new name already exists
      const existing = await TagsController.findTagByName(
        updates.name,
        tag.ownerId.toString()
      );

      if (existing && existing._id.toString() !== tagId) {
        throw new AppError(ERROR_CODES.BAD_REQUEST, "Tag name already exists");
      }
    }

    const updatedTag = await TagsController.updateTag(tagId, updates);

    // Audit log
    await AuditService.log({
      userId,
      action: AUDIT_ACTIONS.TAG_UPDATE,
      entityType: "Tag",
      entityId: tagId,
      metadata: updates,
    });

    return updatedTag;
  }

  // Delete tag
  async deleteTag(tagId: string, userId: string, userRole: string) {
    const tag = await TagsController.findTagById(tagId);

    if (!tag) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Tag not found");
    }

    // Check ownership
    if (userRole !== "admin" && tag.ownerId.toString() !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access denied");
    }

    // Check if tag is used as primary tag (cannot delete)
    const isUsedAsPrimary = await TagsController.isTagUsedAsPrimary(tagId);

    if (isUsedAsPrimary) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Cannot delete tag that is used as primary tag in documents. Remove it from documents first."
      );
    }

    // Get document count for audit
    const docCount = await TagsController.countDocumentsWithTag(tagId);

    // Delete tag
    await TagsController.deleteTag(tagId);

    // Delete all document-tag relationships
    const { DocumentTagModel } = require("../models");
    await DocumentTagModel.deleteMany({ tagId });

    // Audit log
    await AuditService.log({
      userId,
      action: AUDIT_ACTIONS.TAG_DELETE,
      entityType: "Tag",
      entityId: tagId,
      metadata: { name: tag.name, documentsAffected: docCount },
    });

    return { message: "Tag deleted successfully", documentsAffected: docCount };
  }
}

export default new TagsService();