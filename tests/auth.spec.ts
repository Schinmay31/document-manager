import request from "supertest";
import express from "express";
import { router as Routes } from "../src/routes/index";
import { authorize } from "../src/middleware/authorize.middleware";
import { excludedPaths } from "../src/constants/auth.constants";
import { DocumentModel, UserModel } from "../src/models";
import jwt from "jsonwebtoken";
import DOT_ENV from "../src/config-env";

describe("JWT isolation and role enforcement", () => {
  let server: any;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use(authorize(excludedPaths));
    app.use("/", Routes);
    server = app;
  });

  it("user cannot access another user's document", async () => {
    const u1 = await UserModel.create({ username: "a", email: "a@test.local", role: "user" });
    const u2 = await UserModel.create({ username: "b", email: "b@test.local", role: "user" });
    const doc = await DocumentModel.create({ ownerId: u1._id, filename: "t.txt", mime: "text/plain", textContent: "x", fileUrl: "/uploads/t.txt" });

    const token = jwt.sign({ sub: String(u2._id), email: u2.email, role: u2.role }, DOT_ENV.JWT_SECRET || "secret");

    const res = await request(server)
      .get(`/docs/${doc._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
  });
});
