import TagsController from "../src/controllers/tag.controller";
import DocsController from "../src/controllers/document.controller";
import { TagModel, DocumentModel, UserModel } from "../src/models";

describe("Primary tag uniqueness", () => {
  it("should prevent attaching more than one primary tag to a document", async () => {
    const user = await UserModel.create({ email: "u2@test.local", role: "user" });
    const t1 = await TagModel.create({ name: "primary1", ownerId: user._id });
    const t2 = await TagModel.create({ name: "primary2", ownerId: user._id });
    const doc = await DocumentModel.create({ ownerId: user._id, filename: "d1.txt", mime: "text/plain", textContent: "hello", fileUrl: "/uploads/d1.txt" });

    // attach first primary
    await DocsController.attachPrimaryTag(String(doc._id), String(t1._id));

    // attaching another primary should throw
    await expect(DocsController.attachPrimaryTag(String(doc._id), String(t2._id))).rejects.toThrow();
  });
});
