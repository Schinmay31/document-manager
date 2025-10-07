import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  role: "admin" | "support" | "moderator" | "user";
}

export interface IAuth {
  path: RegExp;
  method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
}
