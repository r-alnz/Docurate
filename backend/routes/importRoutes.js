import express from "express";
import User from "../models/userModel.js";
import { authToken } from "../middleware/auth.js";
import mongoose from "mongoose"; // Needed for ObjectId

const router = express.Router();

router.post("/bulk-import", authToken, async (req, res) => {
    try {
        console.log("Received bulk import request:", req.body);

        const users = req.body;
        const loggedInUser = req.user; // Retrieved from authToken middleware

        if (!loggedInUser || !loggedInUser.organization) {
            return res.status(400).json({ error: "User's organization is missing" });
        }

        console.log("Logged-in User's Organization:", loggedInUser.organization);

        if (!Array.isArray(users) || users.length === 0) {
            console.log("Invalid data format received:", users);
            return res.status(400).json({ error: "Invalid data format. Expected a non-empty array of users." });
        }

        // Validate users and track missing fields
        const invalidUsers = users
            .map((user, index) => {
                const missingFields = [];
                if (!user.firstname) missingFields.push("firstname");
                if (!user.lastname) missingFields.push("lastname");
                if (!user.email) missingFields.push("email");
                if (!user.password) missingFields.push("password");
                if (!user.role) missingFields.push("role");

                console.log(`User at index ${index}:`, JSON.stringify(user, null, 2));
                console.log(`Missing fields:`, missingFields);

                return missingFields.length > 0 ? { index, missingFields } : null;
            })
            .filter(Boolean);

        if (invalidUsers.length > 0) {
            return res.status(400).json({
                error: "Some users are missing required fields.",
                invalidUsers,
            });
        }

        // 🔥 Assign the logged-in user's organization ID to imported users
        const formattedUsers = users.map((user) => ({
            ...user,
            organization: new mongoose.Types.ObjectId(loggedInUser.organization), // Convert to ObjectId
            studentId: user.studentId || new mongoose.Types.ObjectId(), // Generate if missing
        }));

        // Insert users
        const newUsers = await User.insertMany(formattedUsers);

        res.status(201).json({ message: "Users imported successfully", newUsers });
    } catch (error) {
        console.error("Error importing users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
