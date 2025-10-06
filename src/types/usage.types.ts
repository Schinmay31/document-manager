import mongoose, { Document } from "mongoose";

export interface IUsage extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;      // e.g., "scoped_action"
    credits: number;     // 5 per action
    metadata: object;
    createdAt: Date;
}