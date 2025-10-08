// controllers/tags.controller.ts
import { TagModel } from "../models";

class TagsController {
  // Create tag
  static async createTag(data: { name: string; ownerId: string }) {
    return await TagModel.create(data);
  }

  // Find tag by name and owner
  static async findTagByName(name: string, ownerId: string) {
    return await TagModel.findOne({
      name: name.toLowerCase().trim(),
      ownerId,
    }).lean();
  }

  // Find or create tag (for auto-create functionality)
  static async findOrCreateTag(name: string, ownerId: string) {
    const normalizedName = name.toLowerCase().trim();

    let tag;

     tag= await TagModel.findOne({
      name: normalizedName,
      ownerId,
    }).lean();

    if (!tag) {
      tag = await TagModel.create({
        name: normalizedName,
        ownerId,
      });
    }

    return tag;
  }

  // Find tag by ID
  static async findTagById(tagId: string) {
    return await TagModel.findById(tagId).lean();
  }

  // Find all tags by owner
  static async findTagsByOwner(ownerId: string) {
    return await TagModel.find({ ownerId })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Find all tags (admin only)
  static async findAllTags() {
    return await TagModel.find()
      .sort({ createdAt: -1 })
      .lean();
  }

  // Update tag
  static async updateTag(tagId: string, updates: any) {
    return await TagModel.findByIdAndUpdate(tagId, updates, {
      new: true,
      runValidators: true,
    }).lean();
  }

  // Delete tag
  static async deleteTag(tagId: string) {
    return await TagModel.findByIdAndDelete(tagId);
  }

  // Check if tag is used as primary tag
  static async isTagUsedAsPrimary(tagId: string) {
    const { DocumentTagModel } = require("../models");
    const count = await DocumentTagModel.countDocuments({
      tagId,
      isPrimary: true,
    });
    return count > 0;
  }

  // Count documents using tag
  static async countDocumentsWithTag(tagId: string) {
    const { DocumentTagModel } = require("../models");
    return await DocumentTagModel.countDocuments({ tagId });
  }
}

export default TagsController;