// services/actions.service.ts
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../utils/master-constants";
import UsageController from "../controllers/usage.controller";
import AuditService from "./audit.service";
import fs from "fs";
import path from "path";
import DocsController from "../controllers/document.controller";
import TagsController from "../controllers/tag.controller";
import DOT_ENV from "../config-env";
import { AUDIT_ACTIONS } from "../constants/document.constant";

interface ScopePayload {
  type: "folder" | "files";
  name?: string;
  ids?: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

class ActionsService {
  // Run scoped action
  async runAction(payload: {
    userId: string;
    userRole: string;
    scope: ScopePayload;
    messages: Message[];
    actions: string[];
  }) {
    const { userId, userRole, scope, messages, actions } = payload;

    // 1. Validate scope rule: folder OR files, not both
    this.validateScope(scope);

    // 2. Collect document context
    const docs = await this.getDocumentsInScope(scope, userId, userRole);

    if (docs.length === 0) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "No documents found in the specified scope"
      );
    }

    // 3. Build context for mock AI
    const context = this.buildContext(docs);

    // 4. Get user prompt
    const userPrompt = messages.find((m) => m.role === "user")?.content || "";

    // 5. Process actions
    const results = [];

    for (const action of actions) {
      if (action === "make_csv") {
        const csvDoc = await this.generateCSV(userId, context, userPrompt);
        results.push(csvDoc);
      } else if (action === "make_document") {
        const textDoc = await this.generateDocument(
          userId,
          context,
          userPrompt
        );
        results.push(textDoc);
      } else {
        throw new AppError(
          ERROR_CODES.BAD_REQUEST,
          `Unknown action: ${action}`
        );
      }
    }

    // 6. Track usage (5 credits)
    await UsageController.createUsage({
      userId,
      action: "scoped_action",
      credits: 5,
      metadata: {
        scope,
        actions,
        documentsProcessed: docs.length,
      },
    });

    // 7. Audit log
    await AuditService.log({
      userId,
      action: AUDIT_ACTIONS.ACTION_RUN,
      entityType: "Action",
      entityId: results[0]?._id?.toString() || "unknown",
      metadata: {
        scope,
        actions,
        documentsProcessed: docs.length,
        credits: 5,
      },
    });

    return {
      results,
      documentsProcessed: docs.length,
      creditsUsed: 5,
    };
  }

  // Validate scope rule
  private validateScope(scope: ScopePayload) {
    if (!scope.type) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Scope type is required (folder or files)"
      );
    }

    if (scope.type !== "folder" && scope.type !== "files") {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        "Scope type must be 'folder' or 'files'"
      );
    }

    // Folder scope requires name
    if (scope.type === "folder") {
      if (!scope.name) {
        throw new AppError(
          ERROR_CODES.BAD_REQUEST,
          "Folder name is required for folder scope"
        );
      }
      // Cannot specify both folder and file IDs
      if (scope.ids && scope.ids.length > 0) {
        throw new AppError(
          ERROR_CODES.BAD_REQUEST,
          "Cannot specify both folder and file IDs"
        );
      }
    }

    // Files scope requires IDs
    if (scope.type === "files") {
      if (!scope.ids || scope.ids.length === 0) {
        throw new AppError(
          ERROR_CODES.BAD_REQUEST,
          "File IDs are required for files scope"
        );
      }
      // Cannot specify folder name with files
      if (scope.name) {
        throw new AppError(
          ERROR_CODES.BAD_REQUEST,
          "Cannot specify folder name with files scope"
        );
      }
    }
  }

  // Get documents based on scope
  private async getDocumentsInScope(
    scope: ScopePayload,
    userId: string,
    userRole: string
  ) {
    if (scope.type === "folder") {
      return await DocsController.getDocumentsByFolderName(
        scope.name!,
        userId,
        userRole
      );
    } else {
      return await DocsController.getDocumentsByIds(
        scope.ids!,
        userId,
        userRole
      );
    }
  }

  // Build context from documents
  private buildContext(docs: any[]) {
    return docs.map((doc) => ({
      id: doc._id.toString(),
      filename: doc.filename,
      content: doc.textContent.slice(0, 500), // Sample content
      mime: doc.mime,
    }));
  }

  // Mock AI: Generate CSV
  private async generateCSV(
    userId: string,
    context: any[],
    userPrompt: string
  ) {
    // Deterministic CSV generation
    const csvRows = ["Filename,Type,ContentLength"];

    context.forEach((doc) => {
      csvRows.push(`${doc.filename},${doc.mime},${doc.content.length}`);
    });

    // Add a summary row based on prompt keywords
    if (
      userPrompt.toLowerCase().includes("vendor") ||
      userPrompt.toLowerCase().includes("total")
    ) {
      csvRows.push("");
      csvRows.push("Vendor,Amount");
      // Extract mock vendor data from filenames
      context.forEach((doc, idx) => {
        const vendorMatch = doc.filename.match(/vendor[_-](\w+)/i);
        const vendor = vendorMatch ? vendorMatch[1] : `Vendor${idx + 1}`;
        const amount = (idx + 1) * 1000; // Mock amount
        csvRows.push(`${vendor},${amount}`);
      });
    }

    const csvContent = csvRows.join("\n");

    // Save CSV to file
    const timestamp = Date.now();
    const filename = `generated_report_${timestamp}.csv`;
    const uploadDir = DOT_ENV.UPLOAD_DIR || "./uploads";
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, csvContent);

    // Create document record
    const doc = await DocsController.createDocument({
      ownerId: userId,
      filename,
      mime: "text/csv",
      textContent: csvContent,
      fileUrl: `/uploads/${filename}`,
    });

    // Auto-tag as "generated"
    const generatedTag = await TagsController.findOrCreateTag(
      "generated",
      userId
    );
    await DocsController.attachPrimaryTag(
      doc._id.toString(),
      String(generatedTag._id)
    );

    return doc;
  }

  // Mock AI: Generate document
  private async generateDocument(
    userId: string,
    context: any[],
    userPrompt: string
  ) {
    // Deterministic document generation
    const lines = [
      `Summary Report`,
      `Generated at: ${new Date().toISOString()}`,
      ``,
      `Request: ${userPrompt}`,
      ``,
      `Documents Processed: ${context.length}`,
      ``,
      `Document List:`,
    ];

    context.forEach((doc, idx) => {
      lines.push(`${idx + 1}. ${doc.filename}`);
      lines.push(`   Type: ${doc.mime}`);
      lines.push(`   Preview: ${doc.content.slice(0, 100)}...`);
      lines.push(``);
    });

    // Add analysis based on prompt
    lines.push(`Analysis:`);
    if (userPrompt.toLowerCase().includes("summary")) {
      lines.push(`- Total documents analyzed: ${context.length}`);
      lines.push(`- All documents have been reviewed and cataloged.`);
    }
    if (userPrompt.toLowerCase().includes("vendor")) {
      lines.push(`- Vendor documents identified and processed.`);
    }

    const textContent = lines.join("\n");

    // Save to file
    const timestamp = Date.now();
    const filename = `summary_${timestamp}.txt`;
    const uploadDir = DOT_ENV.UPLOAD_DIR || "./uploads";
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, textContent);

    // Create document record
    const doc = await DocsController.createDocument({
      ownerId: userId,
      filename,
      mime: "text/plain",
      textContent,
      fileUrl: `/uploads/${filename}`,
    });

    // Auto-tag as "generated"
    const generatedTag = await TagsController.findOrCreateTag(
      "generated",
      userId
    );
    await DocsController.attachPrimaryTag(
      doc._id.toString(),
      String(generatedTag._id)
    );

    return doc;
  }

  // Get monthly usage
  async getMonthlyUsage(
    userId: string,
    userRole: string,
    year?: number,
    month?: number
  ) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    if (userRole === "admin") {
      // Admin can see all users
      return await UsageController.getAllUsersMonthlyUsage(
        targetYear,
        targetMonth
      );
    } else {
      // User can only see own usage
      return await UsageController.getMonthlyUsage(
        userId,
        targetYear,
        targetMonth
      );
    }
  }
}

export default new ActionsService();