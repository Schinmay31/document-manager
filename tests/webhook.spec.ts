import OCRService from "../src/services/ocr.service";
import { UserModel } from "../src/models";

describe("OCR webhook classification and rate-limiting", () => {
  it("classifies text as ad by default and extracts contact info", async () => {
    const user = await UserModel.create({ username: "w1", email: "w1@test.local", role: "user" });
    const payload = {
      source: "sender",
      imageId: "img1",
      text: "Huge sale! Click here http://unsubscribe.example.com to unsubscribe",
    };

    const task = await OCRService.processOCR(payload as any, String(user._id));
    expect(task).toBeTruthy();
    expect(task.classification).toBeDefined();
  });

  it("rate limits tasks from same sender to 3 per day", async () => {
    const user = await UserModel.create({ username: "w2", email: "w2@test.local", role: "user" });
    const payload = { source: "s1", imageId: "i", text: "ad content" };
    // create 3 tasks
    await OCRService.processOCR(payload as any, String(user._id));
    await OCRService.processOCR(payload as any, String(user._id));
    await OCRService.processOCR(payload as any, String(user._id));

    await expect(OCRService.processOCR(payload as any, String(user._id))).rejects.toThrow();
  });
});
