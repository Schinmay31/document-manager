import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  role: "admin" | "support" | "moderator" | "user";
}