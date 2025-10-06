import mongoose, { Document, Schema } from "mongoose";
import { ITag } from "../types/tag.types";

const TagSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const TagModel = mongoose.model<ITag>("Tag", TagSchema);
export default TagModel;
