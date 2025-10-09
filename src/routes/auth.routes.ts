import express, { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import AuthService from "../services/auth.service";
import { loginValidator } from "../validators/auth.validator";
import validateRequest from "../middleware/validate.middleware";

const authRoutes = express.Router();

// Auth routes

// demo login route with no real authentication
authRoutes.post(
  "/login",
  loginValidator,
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await AuthService.login({ email });

    res.json({ success: true, user });
  })
);

export default authRoutes;
