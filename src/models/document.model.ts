import mongoose, { Schema } from "mongoose";
import { IDocument } from "../types/document.types";

const DocumentSchema: Schema = new Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: { type: String, required: true },
    mime: { type: String, required: true },
    textContent: { type: String, required: true },
    fileUrl: { type: String, required: true },
  },
  { timestamps: true }
);
const DocumentModel = mongoose.model<IDocument>("Document", DocumentSchema);
export default DocumentModel;
