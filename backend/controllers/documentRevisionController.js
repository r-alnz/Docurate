// documentRevisionController.js
import DocumentRevision from "../models/documentRevisionModel.js"
import Document from "../models/documentModel.js"

// Create a new document revision
const createDocumentRevision = async (req, res) => {
  try {
    const { content, description } = req.body
    const documentId = req.params.documentId

    if (!content) {
      return res.status(400).json({ message: "Content is required." })
    }

    // Verify document exists and user has access
    const document = await Document.findById(documentId)
    if (!document) {
      return res.status(404).json({ message: "Document not found." })
    }

    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action." })
    }

    const revision = new DocumentRevision({
      document: documentId,
      content,
      description: description || "Automatic save",
      user: req.user._id,
      organization: req.user.organization,
    })

    await revision.save()
    res.status(201).json(revision)
  } catch (error) {
    console.error("Error creating document revision:", error)
    res.status(500).json({ message: "Failed to create document revision." })
  }
}

// Get all revisions for a document
const getDocumentRevisions = async (req, res) => {
  try {
    const documentId = req.params.documentId

    // Verify document exists and user has access
    const document = await Document.findById(documentId)
    if (!document) {
      return res.status(404).json({ message: "Document not found." })
    }

    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action." })
    }

    // Get revisions sorted by creation date (newest first)
    const revisions = await DocumentRevision.find({ document: documentId })
      .sort({ createdAt: -1 })
      .select("description createdAt")

    res.status(200).json(revisions)
  } catch (error) {
    console.error("Error fetching document revisions:", error)
    res.status(500).json({ message: "Failed to fetch document revisions." })
  }
}

// Get a specific revision
const getRevisionById = async (req, res) => {
  try {
    const { documentId, revisionId } = req.params

    // Verify document exists and user has access
    const document = await Document.findById(documentId)
    if (!document) {
      return res.status(404).json({ message: "Document not found." })
    }

    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action." })
    }

    const revision = await DocumentRevision.findOne({
      _id: revisionId,
      document: documentId,
    })

    if (!revision) {
      return res.status(404).json({ message: "Revision not found." })
    }

    res.status(200).json(revision)
  } catch (error) {
    console.error("Error fetching revision:", error)
    res.status(500).json({ message: "Failed to fetch revision." })
  }
}

// Delete a specific revision
const deleteRevision = async (req, res) => {
  try {
    const { documentId, revisionId } = req.params

    // Verify document exists and user has access
    const document = await Document.findById(documentId)
    if (!document) {
      return res.status(404).json({ message: "Document not found." })
    }

    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action." })
    }

    const revision = await DocumentRevision.findOneAndDelete({
      _id: revisionId,
      document: documentId,
    })

    if (!revision) {
      return res.status(404).json({ message: "Revision not found." })
    }

    res.status(200).json({ message: "Revision deleted successfully." })
  } catch (error) {
    console.error("Error deleting revision:", error)
    res.status(500).json({ message: "Failed to delete revision." })
  }
}

export { createDocumentRevision, getDocumentRevisions, getRevisionById, deleteRevision }
