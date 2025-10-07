import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../utils/master-constants";
import JWT from "jsonwebtoken";
import userController from "../controllers/user.controller";
import DOT_ENV from "../config-env";

class AuthService {
  // Generate JWT token
  private generateToken(user: any): string {
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
    };
    const token = JWT.sign(tokenPayload, DOT_ENV.JWT_SECRET!, {
      expiresIn: "8h", // Token expiration time
    });
    return token;
  }

  // LOGIN method
  async login(payload: { email: string }): Promise<{
    token: string;
    userId: string;
  } | null> {
    const { email } = payload;

    const user = await userController.findUserByEmail(email);

    if (!user) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Email does not exist");
    }

    // NO PASSWORD CHECK FOR DEMO PURPOSES
    const token = this.generateToken(user);

    return { token, userId: user._id.toString() };
  }
}

export default new AuthService();
