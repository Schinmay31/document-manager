import { UserModel } from "../models";

class userController {
  static async findUserByEmail(email: string) {
    email = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email }).populate("role");
    return user;
  }
}

export default  userController;