import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../types/user.types";

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["admin", "support", "moderator", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
