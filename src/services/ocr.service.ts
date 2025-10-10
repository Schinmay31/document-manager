// services/ocr.service.ts
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../utils/master-constants";
import TaskController from "../controllers/task.controller";
import AuditService from "./audit.service";
import { AUDIT_ACTIONS } from "../constants/document.constant";

interface OCRPayload {
  source: string;
  imageId: string;
  text: string;
  meta?: Record<string, any>;
}

class OCRService {
  // Financial/Legal keywords for "official" classification
  private readonly OFFICIAL_KEYWORDS = [
    "invoice",
    "receipt",
    "contract",
    "agreement",
    "legal",
    "tax",
    "statement",
    "bill",
    "payment",
    "due",
    "terms and conditions",
    "liability",
    "confidential",
    "authorized",
    "signed",
    "notary",
    "court",
    "official",
  ];

  // Promotional keywords for "ad" classification
  private readonly AD_KEYWORDS = [
    "sale",
    "discount",
    "offer",
    "limited time",
    "buy now",
    "free shipping",
    "deal",
    "promo",
    "subscribe",
    "unsubscribe",
    "click here",
    "shop now",
    "save",
    "exclusive",
    "promotion",
    "coupon",
    "voucher",
  ];

  // Process OCR webhook
  async processOCR(payload: OCRPayload, userId: string) {
    const { source, imageId, text, meta } = payload;

    // 1. Classify the text
    const classification = this.classifyText(text);

    // 2. Check rate limit (max 3 tasks per sender per day per user)
    await this.checkRateLimit(userId, source);

    // 3. Extract unsubscribe info if it's an ad
    let channel: "email" | "url" | null = null;
    let target: string | null = null;

    if (classification === "ad") {
      const unsubscribeInfo = this.extractUnsubscribeInfo(text);
      channel = unsubscribeInfo.channel;
      target = unsubscribeInfo.target;
    }

    // 4. Create task
    const task = await TaskController.createTask({
      userId,
      source,
      classification,
      status: "pending",
      channel,
      target,
      metadata: {
        imageId,
        text,
        ...meta,
      },
    });

    // 5. Audit log
    await AuditService.log({
      userId,
      action: AUDIT_ACTIONS.TASK_CREATE,
      entityType: "Task",
      entityId: String(task._id),
      metadata: {
        source,
        imageId,
        classification,
        channel,
        target,
      },
    });

    return task;
  }

  // Classify text as "official" or "ad"
  private classifyText(text: string): "official" | "ad" {
    const lowerText = text.toLowerCase();

    // Count matches for each category
    let officialCount = 0;
    let adCount = 0;

    this.OFFICIAL_KEYWORDS.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        officialCount++;
      }
    });

    this.AD_KEYWORDS.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        adCount++;
      }
    });

    // Classify based on which has more matches
    // If tie or no matches, default to "ad" (safer for filtering)
    return officialCount > adCount ? "official" : "ad";
  }

  // Extract unsubscribe email or URL
  private extractUnsubscribeInfo(text: string): {
    channel: "email" | "url" | null;
    target: string | null;
  } {
    // Email pattern: mailto:email@domain.com or just email@domain.com
    const emailPattern =
      /(?:mailto:)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const emailMatch = text.match(emailPattern);

    if (emailMatch) {
      return {
        channel: "email",
        target: emailMatch[1], // Extract email without mailto:
      };
    }

    // URL pattern: http(s)://...
    const urlPattern = /(https?:\/\/[^\s<>"]+)/i;
    const urlMatch = text.match(urlPattern);

    if (urlMatch) {
      return {
        channel: "url",
        target: urlMatch[1],
      };
    }

    // No unsubscribe info found
    return {
      channel: null,
      target: null,
    };
  }

  // Check rate limit: max 3 tasks per sender per day per user
  private async checkRateLimit(userId: string, source: string) {
    const count = await TaskController.countTasksBySourceToday(userId, source);

    if (count >= 3) {
      throw new AppError(
        ERROR_CODES.TOO_MANY_REQUESTS,
        `Rate limit exceeded: Maximum 3 tasks per sender (${source}) per day`
      );
    }
  }

  // Get tasks for user
  async getTasks(userId: string, userRole: string, filters: any = {}) {
    // if user is admin, get all tasks, else only own tasks
    if (userRole === "admin") {
      return await TaskController.findAllTasks(filters);
    } else {
      return await TaskController.findTasksByUser(userId, filters);
    }
  }
}

export default new OCRService();