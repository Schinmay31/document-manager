import ActionsService from "../src/services/actions.service";
import DocsController from "../src/controllers/document.controller";
import { TagModel, UserModel, DocumentModel, UsageModel } from "../src/models";

describe("ActionsService - scope rule and credits", () => {
  let user: any;
  beforeEach(async () => {
    user = await UserModel.create({ email: "u1@test.local", role: "user" });
    // create a tag and document attached via DocumentTagModel pipeline
    const tag = await TagModel.create({ name: "invoices", ownerId: user._id });
    const doc = await DocumentModel.create({ ownerId: user._id, filename: "inv1.pdf", mime: "application/pdf", textContent: "invoice total 100", fileUrl: "/uploads/inv1.pdf" });
    // Attach primary tag using DocsController.attachPrimaryTag
    await DocsController.attachPrimaryTag(String(doc._id), String(tag._id));
  });

  it("should reject invalid scope (both folder and files)", async () => {
    await expect(
      ActionsService.runAction({
        userId: String(user._id),
        userRole: "user",
        scope: { type: "folder", name: "invoices", ids: ["1"] as any },
        messages: [{ role: "user", content: "summarize" }],
        actions: ["make_csv"],
      })
    ).rejects.toThrow();
  });

  it("should create usage record (credits) when running action on folder scope", async () => {
    const res = await ActionsService.runAction({
      userId: String(user._id),
      userRole: "user",
      scope: { type: "folder", name: "invoices" },
      messages: [{ role: "user", content: "summary" }],
      actions: ["make_csv"],
    });

    // usage record should be created
  const usage: any = await UsageModel.findOne({ userId: user._id }).lean();
  expect(usage).toBeTruthy();
  expect(usage!.credits).toBeGreaterThan(0);
  expect(res.creditsUsed).toBeGreaterThanOrEqual(usage!.credits);
  });
});
