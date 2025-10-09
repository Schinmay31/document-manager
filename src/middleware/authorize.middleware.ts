import { AppError } from "../utils/AppError";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IAuth } from "../types/auth.types";
import { ERROR_CODES } from "../utils/master-constants";
import { AUTHORIZE } from "../constants/auth.constants";
import DOT_ENV from "../config-env";

export const authorize = (excludedPaths: IAuth[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (
        excludedPaths.find((ep) => {
          return (
            (ep.method === req.method && ep.path.test(req.url)) ||
            req.url.includes("public") 
          );
        })
      ) {
        return next();
      }
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        const JWT_SECRET_KEY = DOT_ENV.JWT_SECRET; 
        if (JWT_SECRET_KEY) {
          try {
            const payload = jwt.verify(token, JWT_SECRET_KEY);
            console.log("payload: ", payload);
            res.locals["userData"] = payload;
            next();
          } catch (error) {
            throw new AppError(
              ERROR_CODES.UNAUTHORIZED,
              AUTHORIZE.SESSION_EXPIRED
            );
          }
        } else {
          throw new AppError(
            ERROR_CODES.INTERNAL_SERVER_ERROR,
            AUTHORIZE.JWT_SECRET_KEY_NOT_FOUND
          );
        }
      } else {
        throw new AppError(
          ERROR_CODES.FORBIDDEN,
          AUTHORIZE.PERMISSION_NOT_GRANTED
        );
      }
    } catch (error) {
      console.log("Error: ", error);
      next(error);
    }
  };
};
