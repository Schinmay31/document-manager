import mongoose, { Document, Schema } from "mongoose";
import { ITask } from "../types/task.types";

const TaskSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: { type: String, required: true },
    classification: { type: String, enum: ["official", "ad"], required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    channel: { type: String, enum: ["email", "url", null], default: null },
    target: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);
TaskSchema.index({ userId: 1, source: 1, createdAt: 1 });

const TaskModel = mongoose.model<ITask & Document>("Task", TaskSchema);
export default TaskModel;
