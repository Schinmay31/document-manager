import { Request, Response, NextFunction } from "express";
import { ROLE_PERMISSIONS } from "../constants/permissions.constants";
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../utils/master-constants";

// Helper to check permission existence for a role
export const hasPermission = (role: string, permission: string) => {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}

interface RequirePermissionOptions {
    resourceOwnerPath?: string;
}

// global Middleware to check if user has the required permission 
export const requirePermission = (permission: string, _options?: RequirePermissionOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals["userData"];
    if (!user) {
      next(new AppError(ERROR_CODES.FORBIDDEN, "Unauthorized"));
      return;
    }

    const role: string = user.role;

    // admin has all permissions
    if (hasPermission(role, "*")) {
      next();
      return;
    }

    // special-case: allow moderator and support to read own resources
    if (permission == "documents:read:own" && (role == "moderator" || role == "support")) {
      next();
      return;
    }

    // check direct permission
    if (hasPermission(role, permission)) {
      next();
      return;
    }

    next(new AppError(ERROR_CODES.FORBIDDEN, "Insufficient permissions"));
    return;
  };
};

export default requirePermission;
