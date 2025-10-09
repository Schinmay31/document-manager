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
export const requirePermission = (
    permission: string,
    options?: RequirePermissionOptions
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user= res.locals["userData"];
        if (!user) {
            return next(new AppError(ERROR_CODES.FORBIDDEN, "Unauthorized"));
        }


        const role: string = user.role;

        // admin has all permissions
        if (hasPermission(role, "*")) return next();

        // check direct permission
        if (hasPermission(role, permission)) return next();

        return next(new AppError(ERROR_CODES.FORBIDDEN, "Insufficient permissions"));
    };
}

export default requirePermission;
