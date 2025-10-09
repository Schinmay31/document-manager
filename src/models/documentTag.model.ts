import mongoose, { Schema } from "mongoose";
import { IDocumentTag } from "../types/document.types";

const DocumentTagSchema: Schema = new Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    tagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const DocumentTagModel = mongoose.model<IDocumentTag>("DocumentTag", DocumentTagSchema);
export default DocumentTagModel;
