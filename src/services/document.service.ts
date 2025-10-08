// services/docs.service.ts
import { AppError } from "../utils/AppError";
import fs from "fs";
import path from "path";
import { ERROR_CODES } from "../utils/master-constants";
import TagsController from "../controllers/tag.controller";
import DocsController from "../controllers/document.controller";
import AuditService from "./audit.service";
import { DOCUMENTACTIONS } from "../constants/document.constant";

class DocsService {
    
  // Upload document with auto-create/get tags
  async uploadDocument(payload: {
    userId: string;
    filename: string;
    primaryTag: string;
    secondaryTags: string[];
    file: any;
  }) {
    const { userId, filename, primaryTag, secondaryTags, file } = payload;

    if (!file) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "File is required");
    }

    if (!primaryTag) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Primary tag is required");
    }

    // Create or get primary tag
    const primaryTagDoc = await TagsController.findOrCreateTag(
      primaryTag,
      userId
    );
    
    // Create or get secondary tags
    const secondaryTagIds = [];
    if (secondaryTags && secondaryTags.length > 0) {
      for (const tagName of secondaryTags) {
        const tag = await TagsController.findOrCreateTag(tagName, userId);
        secondaryTagIds.push(tag._id);
      }
    }

    // Extract text content (mock for now)
    const textContent = `Content of ${filename}.`; // future implementation: Extract real text

    // right now we are not storing actual documents.
    // just demo content for now
    // 
    // Create document
    const doc = await DocsController.createDocument({
      ownerId: userId,
      filename,
      mime: file.mimetype,
      fileUrl: `/uploads/${file.filename}`,
      textContent,
    });

    // Create document-tag relationships
    await DocsController.attachPrimaryTag(String(doc._id), String(primaryTagDoc._id));

    for (const tagId of secondaryTagIds) {
      await DocsController.attachSecondaryTag(String(doc._id), String(tagId));
    }

    // Audit log
    await AuditService.log({
      userId,
      action: DOCUMENTACTIONS.CREATE,
      entityType: "Document",
      entityId: doc._id.toString(),
      metadata: { filename, primaryTag },
    });

    return doc;
  }

  // Get single document
  async getDocument(docId: string, userId: string, userRole: string) {
    const doc = await DocsController.findDocumentById(docId);

    if (!doc) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Document not found");
    }

    // Check ownership (admin can access all)
    if (userRole !== "admin" && doc.ownerId.toString() !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access denied");
    }

    return doc;
  }

  // List documents
  async listDocuments(userId: string, userRole: string, filters: any) {
    const query: any = {};

    // Non-admin can only see their own docs
    if (userRole !== "admin") {
      query.ownerId = userId;
    }

    const docs = await DocsController.findDocuments(query);
    return docs;
  }

  // Update document
  async updateDocument(
    docId: string,
    userId: string,
    userRole: string,
    updates: any
  ) {
    const doc = await DocsController.findDocumentById(docId);

    if (!doc) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Document not found");
    }

    // Check ownership
    if (userRole !== "admin" && doc.ownerId.toString() !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access denied");
    }

    const updatedDoc = await DocsController.updateDocument(docId, updates);

    // Audit log
    await AuditService.log({
      userId,
      action: "document_update",
      entityType: "Document",
      entityId: docId,
      metadata: updates,
    });

    return updatedDoc;
  }

  // Delete document
  async deleteDocument(docId: string, userId: string, userRole: string) {
    const doc = await DocsController.findDocumentById(docId);

    if (!doc) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Document not found");
    }

    // Check ownership
    if (userRole !== "admin" && doc.ownerId.toString() !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Access denied");
    }

    // Delete file from disk
    const filePath = path.join(
      process.cwd(),
      doc.fileUrl.replace(/^\//, "")
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete document and tags
    await DocsController.deleteDocument(docId);
    await DocsController.deleteDocumentTags(docId);

    // Audit log
    await AuditService.log({
      userId,
      action: "document_delete",
      entityType: "Document",
      entityId: docId,
      metadata: { filename: doc.filename },
    });
  }

  // List folders (primary tags with counts)
  async listFolders(userId: string, userRole: string) {
    const folders = await DocsController.getFoldersWithCounts(userId, userRole);
    return folders;
  }

  // List documents in folder
  async listDocumentsInFolder(tagName: string, userId: string, userRole: string) {
    const tag = await TagsController.findTagByName(tagName, userId);

    if (!tag) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Folder not found");
    }

    const docs = await DocsController.findDocumentsByPrimaryTag(
      String(tag._id),
      userId,
      userRole
    );

    return docs;
  }

  // Search documents
  async searchDocuments(payload: {
    userId: string;
    userRole: string;
    query: string;
    scope?: "folder" | "files";
    ids?: string[];
  }) {
    const { userId, userRole, query, scope, ids } = payload;

    // Validate scope rule: folder OR files, not both
    if (scope === "folder" && ids && ids.length > 0) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Cannot specify both folder scope and file IDs"
      );
    }

    if (scope === "files" && (!ids || ids.length === 0)) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "File IDs required for files scope"
      );
    }

    const results = await DocsController.searchDocuments({
      userId,
      userRole,
      query,
      scope,
      ids,
    });

    return results;
  }
}

export default new DocsService();