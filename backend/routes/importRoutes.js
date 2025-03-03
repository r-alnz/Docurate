import express from "express";
import User from "../models/userModel.js";
import { authToken } from "../middleware/auth.js";
import mongoose from "mongoose"; // Needed for ObjectId

const router = express.Router();

router.post("/bulk-import", authToken, async (req, res) => {
    try {
        console.log("Received bulk import request:", req.body);

        // FETCH: User currently logged in
        const loggedInUser = req.user;
        if (!loggedInUser || !loggedInUser.organization) {
            return res.status(400).json({ error: "User's organization is missing" });
        }

        console.log("Logged-in User's Organization:", loggedInUser.organization);

        // FETCH: Users concerned
        const users = req.body;
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ error: "Invalid data format. Expected a non-empty array of users." });
        }

        // CHECK: missing required fields
        const invalidUsers = users
            .map((user, index) => {
                const missingFields = [];
                if (!user.firstname) missingFields.push("firstname");
                if (!user.lastname) missingFields.push("lastname");
                if (!user.email) missingFields.push("email");
                if (!user.password) missingFields.push("password");
                if (!user.role) missingFields.push("role");

                return missingFields.length > 0 ? { 
                    index, 
                    email: user.email, 
                    name: `${user.firstname || "Unknown"} ${user.lastname || "User"}`, // Add name field
                    missingFields 
                } : null;
            })
            .filter(Boolean);

        if (invalidUsers.length > 0) {
            return res.status(400).json({
                error: "Some users are missing required fields.",
                invalidUsers,
            });
        }

        // CHECK: duplicates
        const emails = users.map(user => user.email);
        const existingUsers = await User.find({ email: { $in: emails } });

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Some users already exist.",
                conflicts: existingUsers.map(u => ({ email: u.email, name: `${u.firstname} ${u.lastname}` })),
                nonDuplicates: users.filter(user => !existingUsers.some(e => e.email === user.email)) // Users that are NOT duplicates
            });
        }

        // Assign organization and insert valid users
        const formattedUsers = users.map(user => ({
            ...user,
            organization: new mongoose.Types.ObjectId(loggedInUser.organization),
            studentId: user.studentId || "00000", // Auto-generate if missing
        }));

        // INSERT non-duplicate users
        const newUsers = await User.insertMany(formattedUsers);

        return res.status(201).json({ message: "Users imported successfully", newUsers });

    } catch (error) {
        console.error("Error importing users:", error.message, error.stack);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }    
  });

export default router;
