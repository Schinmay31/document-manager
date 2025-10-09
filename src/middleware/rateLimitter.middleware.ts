import { NextFunction, Request, Response } from "express";
import DOT_ENV from "../config-env";
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../utils/master-constants";


const REQUEST_LIMIT = Number(DOT_ENV.REQUEST_LIMIT);
const WINDOW_MS = Number(DOT_ENV.WINDOW_MS);
const COOLDOWN_MS = Number(DOT_ENV.COOLDOWN_MS) ;
const requestLimits = new Map();

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientIP = req.ip;
  const route = req.path;
  const method = req.method;

  if (clientIP && route && method) {
    const key = `${clientIP}-${route}-${method}`;
    const currentTime = Date.now();
    const entry = requestLimits.get(key) || {
      count: 0,
      startTime: currentTime,
      nextWindowTime: currentTime + WINDOW_MS,
      cooldownTime: null,
    };

    if (entry.cooldownTime && currentTime < entry.cooldownTime) {
      const timeLeft = Math.ceil((entry.cooldownTime - currentTime) / 1000);
      const error = new AppError(
        ERROR_CODES.TOO_MANY_REQUESTS,
        `Please try after ${timeLeft} seconds.`
      );
      next(error);
      return;
    }

    if (currentTime - entry.startTime < WINDOW_MS) {
      if (entry.count >= REQUEST_LIMIT) {
        entry.cooldownTime = currentTime + COOLDOWN_MS;
        entry.count = 0;
        entry.startTime = entry.cooldownTime;
        requestLimits.set(key, entry);
        next();
        return;
      } else {
        entry.count++;
      }
    } else {
      entry.count = 1;
      entry.startTime = currentTime;
      entry.nextWindowTime = currentTime + WINDOW_MS;
      entry.cooldownTime = null;
    }

    requestLimits.set(key, entry);
    return;
  }
  next();
  return;
};