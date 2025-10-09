import { pathToRegexp } from "path-to-regexp";

export const excludedPaths: {
  method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
  path: RegExp;
}[] = [{ method: "POST", path: pathToRegexp("/auth/login").regexp }];

export const AUTHORIZE = {
  PERMISSION_NOT_GRANTED: "PERMISSION NOT GRANTED TO ACCESS THIS URL",
  UNAUTHORIZE_TOKEN: "UNAUTHORIZE TOKEN",
  SESSION_EXPIRED: "SESSION EXPIRED",
  JWT_SECRET_KEY_NOT_FOUND: " JWT SECRET KEY NOT FOUND",
};
