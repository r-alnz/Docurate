import express from "express";
import RemovalRequest from "../models/removalRequestModel.js";

const router = express.Router();

// PUSH REQUESTS
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


// GET REQUESTS
router.get("/removal-requests", async (req, res) => {
  try {
    const requests = await RemovalRequest.find();
    console.log("Fetched requests:", requests); // ✅ Debugging log
    res.json(requests);
  } catch (error) {
    console.error("Error fetching removal requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
