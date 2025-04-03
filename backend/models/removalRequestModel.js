import mongoose from 'mongoose'

const removalRequestSchema = new mongoose.Schema(
  {
    requestingUser: { type: String, required: true },
    removingUser: { type: String, required: true },
    studentId: { type: String, required: false },
    organization: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Organization',
    },
    reason: { type: String, required: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true,
    collection: "removals"
   }
);

// Optional: Indexes for efficient querying
removalRequestSchema.index({ studentId: 1, removingUser: 1 });

const RemovalRequest = mongoose.model('RemovalRequest', removalRequestSchema);

export default RemovalRequest;
