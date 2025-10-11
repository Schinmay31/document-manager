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

    tag = await TagModel.findOne({
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

}

export default TagsController;