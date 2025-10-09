// Permission strings and role -> permissions mapping
export const PERMISSIONS = {
  DOCUMENTS: {
    CREATE: "documents:create",
    READ_ANY: "documents:read:any",
    READ_OWN: "documents:read:own",
    UPDATE_ANY: "documents:update:any",
    UPDATE_OWN: "documents:update:own",
    DELETE_ANY: "documents:delete:any",
    DELETE_OWN: "documents:delete:own",
  },
  TAGS: {
    CREATE: "tags:create",
    READ_ANY: "tags:read:any",
    READ_OWN: "tags:read:own",
    UPDATE_ANY: "tags:update:any",
    UPDATE_OWN: "tags:update:own",
    DELETE_ANY: "tags:delete:any",
    DELETE_OWN: "tags:delete:own",
  },
  ACTIONS: {
    RUN: "actions:run",
  },
  USAGE: {
    VIEW_ANY: "usage:view:any",
    VIEW_OWN: "usage:view:own",
  },
  TASKS: {
    CREATE: "tasks:create",
    READ_ANY: "tasks:read:any",
    READ_OWN: "tasks:read:own",
    UPDATE_ANY: "tasks:update:any",
    UPDATE_OWN: "tasks:update:own",
  },
};

// Roles and permission mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["*"] /* wildcard: full access */,
  support: [
    // read-only across core resources
    PERMISSIONS.DOCUMENTS.READ_ANY,
    PERMISSIONS.TAGS.READ_ANY,
    PERMISSIONS.TASKS.READ_ANY,
    PERMISSIONS.USAGE.VIEW_ANY,
  ],
  moderator: [
    // read-only across core resources
    PERMISSIONS.DOCUMENTS.READ_ANY,
    PERMISSIONS.TAGS.READ_ANY,
    PERMISSIONS.TASKS.READ_ANY,
    PERMISSIONS.USAGE.VIEW_ANY,
  ],
  user: [
    // can create documents and tags and act on own resources
    PERMISSIONS.DOCUMENTS.CREATE,
    PERMISSIONS.DOCUMENTS.READ_OWN,
    PERMISSIONS.DOCUMENTS.UPDATE_OWN,
    PERMISSIONS.DOCUMENTS.DELETE_OWN,
    PERMISSIONS.TAGS.CREATE,
    PERMISSIONS.TAGS.READ_OWN,
    PERMISSIONS.TAGS.UPDATE_OWN,
    PERMISSIONS.TAGS.DELETE_OWN,
    PERMISSIONS.ACTIONS.RUN,
    PERMISSIONS.USAGE.VIEW_OWN,
    PERMISSIONS.TASKS.CREATE,
    PERMISSIONS.TASKS.READ_OWN,
    PERMISSIONS.TASKS.UPDATE_OWN,
  ],
};

export default PERMISSIONS;
