import express from "express";
import RemovalRequest from "../models/removalRequestModel.js";
import { authToken } from "../middleware/auth.js"; // Import auth middleware

const router = express.Router();

// PUSH REQUESTS
router.post("/remove-request", authToken, async (req, res) => { // Apply authToken to ensure req.user exists
  try {
    const { requestingUser, removingUser, studentId, reason, organization } = req.body;

    const removalRequest = new RemovalRequest({
        requestingUser,
        removingUser,
        studentId,
        reason,
        organization
    });

    await removalRequest.save(); // saves to "removals" collection

    res.status(201).json({ message: "✅ Removal request submitted successfully" });
  } catch (error) {
      console.error("❌ Error saving removal request:", error);
      res.status(500).json({ message: "Failed to process removal request" });
  }
});

// GET REQUESTS (Only for the user's organization)
router.get("/remove-request", authToken, async (req, res) => { // Apply authToken to ensure req.user exists
  try {
    console.log("🔍 Fetching removal requests...");

    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user data found" });
    }

    const { organization } = req.user;
    console.log("fetch reqs for:", organization);
    

    if (!organization) {
      return res.status(400).json({ message: "Organization is required." });
    }

    // Fetch removal requests only for the user's organization
    const requests = await RemovalRequest.find({ organization });
    
    console.log("✅ Fetched requests:", requests); // ✅ Debugging log
    res.json(requests);
  } catch (error) {
    console.error("❌ Error fetching removal requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH: Update status of a removal request
router.patch("/remove-request/:id", authToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expecting the new status in the request body

  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user data found" });
    }

    // Find and update the removal request status by ID
    const updatedRequest = await RemovalRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true } // This ensures the response is the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error("❌ Error updating removal request status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;