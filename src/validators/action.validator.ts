import { body, query } from "express-validator";

export const runActionValidator = [
  // scope can be an object or a JSON string representing { type, name }
  body("scope").custom((value, { req }) => {
    let v = value;
    if (typeof v === "string") {
      try {
        v = JSON.parse(v);
        req.body.scope = v;
      } catch (e) {
        throw new Error("scope must be an object or a JSON string");
      }
    }

    if (!v || typeof v !== "object") {
      throw new Error("scope must be an object with { type, name }");
    }

    const allowed = ["folder", "files"];
    if (!v.type || !allowed.includes(v.type)) {
      throw new Error(`scope.type must be one of: ${allowed.join(",")}`);
    }

    if (!v.name || typeof v.name !== "string") {
      throw new Error("scope.name must be a string");
    }

    return true;
  }),

  // messages: accept array or JSON string of array
  body("messages").custom((value, { req }) => {
    let v = value;
    if (typeof v === "string") {
      try {
        v = JSON.parse(v);
        req.body.messages = v;
      } catch (e) {
        throw new Error("messages must be an array or JSON string of messages");
      }
    }

    if (!Array.isArray(v)) {
      throw new Error("messages must be an array");
    }

    for (const msg of v) {
      if (!msg || typeof msg !== "object") throw new Error("each message must be an object");
      if (!msg.role || typeof msg.role !== "string")
        throw new Error("each message.role must be a string");
      if (!msg.content || typeof msg.content !== "string")
        throw new Error("each message.content must be a string");
    }

    return true;
  }),

  // actions: array of strings (or JSON string)
  body("actions").custom((value, { req }) => {
    let v = value;
    if (typeof v === "string") {
      try {
        v = JSON.parse(v);
        req.body.actions = v;
      } catch (e) {
        // allow comma-separated fallback
        v = value
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
        req.body.actions = v;
      }
    }

    if (!Array.isArray(v)) {
      throw new Error("actions must be an array of strings");
    }

    if (!v.every((a) => typeof a === "string")) {
      throw new Error("each action must be a string");
    }

    return true;
  }),
];

export const usageQueryValidator = [
  query("year").optional().isInt(),
  query("month").optional().isInt(),
];
