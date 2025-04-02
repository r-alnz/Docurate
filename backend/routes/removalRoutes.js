import express from "express";
import RemovalRequest from "../models/removalRequestModel.js";

const router = express.Router();

router.post("/remove-request", async (req, res) => {
  try {
    const { requestingUser, removingUser, studentId, reason } = req.body;

    const removalRequest = new RemovalRequest({
        requestingUser,
        removingUser,
        studentId,
        reason,
    });

    await removalRequest.save(); // saves to "removals" collection

    res.status(201).json({ message: "✅ Removal request submitted successfully" });
  } catch (error) {
      console.error("❌ Error saving removal request:", error);
      res.status(500).json({ message: "Failed to process removal request" });
  }
});

export default router;
