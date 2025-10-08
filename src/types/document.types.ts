import mongoose, { Document } from "mongoose";
import { IUser as IOwner } from "../types/user.types";
import { ITag } from "./tag.types";

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: IOwner["_id"];
  filename: string;
  mime: string;
  textContent: string;
  fileUrl: string;
}

export interface IDocumentTag extends Document {
    documentId: IDocument["_id"];
    tagId: ITag["_id"];
    isPrimary: boolean;
}
