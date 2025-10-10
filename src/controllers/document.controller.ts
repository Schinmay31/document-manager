// controllers/docs.controller.ts
import { DocumentModel, DocumentTagModel, TagModel } from "../models";
import mongoose from "mongoose";

class DocsController {
  // Create document
  static async createDocument(data: {
    ownerId: string;
    filename: string;
    mime: string;
    fileUrl: string;
    textContent: string;
  }) {
    return await DocumentModel.create(data);
  }

  // Find document by ID
  static async findDocumentById(docId: string) {
    return await DocumentModel.findById(docId).lean();
  }

  // Find documents
  static async findDocuments(query: any) {
    return await DocumentModel.find(query).sort({ createdAt: -1 }).lean();
  }

  // Update document
  static async updateDocument(docId: string, updates: any) {
    return await DocumentModel.findByIdAndUpdate(docId, updates, {
      new: true,
    }).lean();
  }

  // Delete document
  static async deleteDocument(docId: string) {
    return await DocumentModel.findByIdAndDelete(docId);
  }

  // Attach primary tag
  static async attachPrimaryTag(docId: string, tagId: string) {
    // Check if primary tag already exists
    const existing = await DocumentTagModel.findOne({
      documentId: docId,
      isPrimary: true,
    });

    if (existing) {
      throw new Error("Document already has a primary tag");
    }

    return await DocumentTagModel.create({
      documentId: docId,
      tagId,
      isPrimary: true,
    });
  }

  // Attach secondary tag
  static async attachSecondaryTag(docId: string, tagId: string) {
    return await DocumentTagModel.create({
      documentId: docId,
      tagId,
      isPrimary: false,
    });
  }

  // Delete all document tags
  static async deleteDocumentTags(docId: string) {
    return await DocumentTagModel.deleteMany({ documentId: docId });
  }

  // Get folders with document counts
  static async getFoldersWithCounts(userId: string, userRole: string) {
    // Fetch tags visible to this user (owner filter for non-admins)
    const tagQuery: any = {};
    if (userRole !== "admin") {
      tagQuery.ownerId = userId;
    }

    const tags = await TagModel.find(tagQuery).lean();

    // For each tag count documents where this tag is primary
    const counts = await Promise.all(
      tags.map(async (t: any) => {
        const cnt = await DocumentTagModel.countDocuments({
          tagId: t._id,
          isPrimary: true,
        });
        return { tag: t, count: cnt };
      })
    );

    // Filter out tags with zero primary documents and return shape { name, tagId, count }
    const folders = counts
      .filter((c) => c.count > 0)
      .map((c) => ({ name: c.tag.name, tagId: c.tag._id, count: c.count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return folders;
  }

  // Find documents by primary tag
  static async findDocumentsByPrimaryTag(
    tagId: string,
    userId: string,
    userRole: string
  ) {
    const matchStage: any = { isPrimary: true, tagId };

    const match = { ...matchStage }; // Start with your initial match conditions for DocumentTag

    // 1. Find the DocumentTag entries that match the criteria
    let query = DocumentTagModel.find(match)
      .populate({
        path: "documentId",
        model: "Document",
        match:
          userRole === "admin"
            ? {}
            : { ownerId: new mongoose.Types.ObjectId(userId) },
        select: "-__v",
      })
      .sort({ "documentId.createdAt": -1 });

    const documentTags = await query.exec();

    const docs = documentTags
      .filter((docTag) => docTag.documentId !== null)
      .map((docTag) => docTag.documentId);

    return docs;
  }

  static async getDocumentsByFolderName(tagName: string, userId: string, userRole: string) {
    // Find tag by name
    const tag = await TagModel.findOne({
      name: tagName.toLowerCase(),
      ...(userRole !== "admin" && { ownerId: userId }),
    }).lean();

    if (!tag) {
      return [];
    }

    // Find documents with this primary tag
    const docs = await DocumentTagModel.aggregate([
      { $match: { tagId: tag._id, isPrimary: true } },
      {
        $lookup: {
          from: "documents",
          localField: "documentId",
          foreignField: "_id",
          as: "document",
        },
      },
      { $unwind: "$document" },
      {
        $match:
          userRole === "admin"
            ? {}
            : { "document.ownerId": new mongoose.Types.ObjectId(userId) },
      },
      {
        $project: {
          _id: "$document._id",
          filename: "$document.filename",
          textContent: "$document.textContent",
          mime: "$document.mime",
        },
      },
    ]);

    return docs;
  }

  // Search documents
  static async searchDocuments(payload: {
    userId: string;
    userRole: string;
    query: string;
    scope?: "folder" | "files";
    ids?: string[];
  }) {
    const { userId, userRole, query, scope, ids } = payload;

  const searchRegex = new RegExp(query, "i");

  const matchStage: any = {
    // 1. Remove $text: { $search: query }
    $or: [{ filename: { $regex: searchRegex } }, { textContent: { $regex: searchRegex } }],
  };

  // Apply ownership filter
  if (userRole !== "admin") {
    matchStage.$and = matchStage.$and || []; // Ensure $and exists if needed
    matchStage.$and.push({ ownerId: new mongoose.Types.ObjectId(userId) });
  }

    // Apply scope filter
    if (scope === "files" && ids) {
      matchStage._id = {
        $in: ids.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const results = await DocumentModel.find(matchStage)
      .select("filename mime textContent createdAt")
      .lean();

    return results;
  }

  // Get documents by IDs
   static async getDocumentsByIds(docIds: string[], userId: string, userRole: string) {
    const query: any = { _id: { $in: docIds } };

    // Non-admin can only access their own docs
    if (userRole !== "admin") {
      query.ownerId = userId;
    }

    return await DocumentModel.find(query)
      .select("filename textContent mime")
      .lean();
  }
}

export default DocsController;
