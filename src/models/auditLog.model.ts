import mongoose, { Document, Schema } from "mongoose";
import { IAuditLog } from "../types//auditLog.types";

const AuditLogSchema: Schema = new Schema(
  {
    at: { type: Date, default: Date.now },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLogModel;
