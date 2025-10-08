// routes/docs.routes.ts
import express, { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import upload from "../config/multer.config";
import DocsService from "../services/document.service";
import multer from "multer";



const docsRoutes = express.Router();

// Upload document with tags
docsRoutes.post(
  "/",
  upload.fields([{name: 'file'}]),
  asyncHandler(async (req: any, res: Response) => {

    const userId = res.locals["userData"].id;

    let {  primaryTag, secondaryTags } = req.body;
    secondaryTags: secondaryTags ? JSON.parse(secondaryTags) : []
    const file = req.files["file"]?.[0];

    const doc = await DocsService.uploadDocument({
      userId,
      filename: file?.originalname || "untitled",
      primaryTag,
      secondaryTags: secondaryTags ? JSON.parse(secondaryTags) : [],
      file,
    });

    res.status(201).json({ success: true, data: doc });
  })
);

// Search documents
docsRoutes.get(
  "/search",
  asyncHandler(async (req: any, res: Response) => {
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const { q, scope, ids } = req.query;
    console.log('req.query: ', req.query);

    const results = await DocsService.searchDocuments({
      userId,
      userRole,
      query: q as string,
      scope: scope as "folder" | "files",
      ids: ids ? (Array.isArray(ids) ? ids : [ids]) : undefined,
    });

    res.json({ success: true, data: results });
  })
);

// List folders (all primary tags with doc counts)
docsRoutes.get(
  "/folders",
  asyncHandler(async (req: any, res: Response) => {
   const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;

    const folders = await DocsService.listFolders(userId, userRole);

    res.json({ success: true, data: folders });
  })
);

// Get single document
docsRoutes.get(
  "/:id",
  asyncHandler(async (req: any, res: Response) => {
    
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const { id } = req.params;

    const doc = await DocsService.getDocument(id, userId, userRole);

    res.json({ success: true, data: doc });
  })
);

// List all documents (filtered by user)
docsRoutes.get(
  "/",
  asyncHandler(async (req: any, res: Response) => {
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const filters = req.query;

    const docs = await DocsService.listDocuments(userId, userRole, filters);

    res.json({ success: true, data: docs });
  })
);

// // Update document
// docsRoutes.put(
//   "/:id",
//   asyncHandler(async (req: any, res: Response) => {
//     const userId = req.user._id;
//     const userRole = req.user.role;
//     const { id } = req.params;
//     const updates = req.body;

//     const doc = await DocsService.updateDocument(id, userId, userRole, updates);

//     res.json({ success: true, data: doc });
//   })
// );

// Delete document
// docsRoutes.delete(
//   "/docs/:id",
//   asyncHandler(async (req: any, res: Response) => {
//     const userId = req.user._id;
//     const userRole = req.user.role;
//     const { id } = req.params;

//     await DocsService.deleteDocument(id, userId, userRole);

//     res.json({ success: true, message: "Document deleted successfully" });
//   })
// );



// List documents in a folder (by primary tag)
docsRoutes.get(
  "/folders/:tag/docs",
  asyncHandler(async (req: any, res: Response) => {
    const userRole = res.locals["userData"].role;
    const userId = res.locals["userData"].id;
    const { tag } = req.params;

    const docs = await DocsService.listDocumentsInFolder(tag, userId, userRole);

    res.json({ success: true, data: docs });
  })
);


export default docsRoutes;