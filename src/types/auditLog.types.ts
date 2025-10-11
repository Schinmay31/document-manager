import mongoose, { Document } from "mongoose";

export interface IAuditLog extends Document {
    at: Date;
    userId: mongoose.Types.ObjectId;
    action: string;      // e.g., "document_upload", "tag_change"
    entityType: string;  // e.g., "Document", "Tag"
    entityId: mongoose.Types.ObjectId;
    metadata: object;
}