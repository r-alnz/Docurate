// documentRevisionRoutes.js
import express from "express"
import {
  createDocumentRevision,
  getDocumentRevisions,
  getRevisionById,
  deleteRevision,
} from "../controllers/documentRevisionController.js"
import { authToken, requireUser } from "../middleware/auth.js"

const router = express.Router()

// Routes for document revision operations
router.post("/documents/:documentId/revisions", authToken, requireUser, createDocumentRevision)
router.get("/documents/:documentId/revisions", authToken, requireUser, getDocumentRevisions)
router.get("/documents/:documentId/revisions/:revisionId", authToken, requireUser, getRevisionById)
router.delete("/documents/:documentId/revisions/:revisionId", authToken, requireUser, deleteRevision)

export default router
