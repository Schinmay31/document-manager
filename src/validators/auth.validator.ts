import { body } from "express-validator";

export const loginValidator = [
  body("email").isEmail().withMessage("email must be a valid email address."),
];
