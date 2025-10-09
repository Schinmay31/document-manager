import mongoose, { Schema } from "mongoose";
import { IUsage } from "../types/usage.types";

const UsageSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: { type: String, required: true },
    credits: { type: Number, required: true, default: 5 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);
const UsageModel = mongoose.model<IUsage>("Usage", UsageSchema);
export default UsageModel;
