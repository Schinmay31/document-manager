
import mongoose, { Document } from "mongoose";

export interface ITask extends Document {
    userId: mongoose.Types.ObjectId;
    source: string;      // e.g., "scanner-01"
    classification: 'official' | 'ad';
    status: 'pending' | 'completed' | 'failed';
    channel: 'email' | 'url' | null;
    target: string;      // email address or URL
    metadata: object;
    createdAt: Date;
    updatedAt: Date;
}