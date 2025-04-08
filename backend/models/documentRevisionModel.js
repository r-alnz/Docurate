// documentRevisionModel.js
import mongoose from "mongoose"

const documentRevisionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "Automatic save",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index to optimize queries by document
documentRevisionSchema.index({ document: 1, createdAt: -1 })

const DocumentRevision = mongoose.model("DocumentRevision", documentRevisionSchema)

export default DocumentRevision
