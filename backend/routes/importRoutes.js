import express from "express"
import multer from "multer"
import xlsx from "xlsx" // To parse Excel files
import User from "../models/userModel.js"
import { authToken } from "../middleware/auth.js"
import mongoose from "mongoose"
import bcrypt from "bcrypt"

const router = express.Router()

// Configure Multer to handle file uploads (memory storage to keep it simple)
const storage = multer.memoryStorage()
const upload = multer({ storage })

// Helper function to check if a string contains only letters
const containsOnlyLetters = (str) => {
  return /^[A-Za-z]+$/.test(str)
}

// Bulk Import Route (Now Accepting Files)
router.post("/bulk-import", authToken, upload.single("file"), async (req, res) => {
  try {
    console.log("Received bulk import request:", req.file)

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    // Parse Excel File
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])

    console.log("Parsed Excel Data:", jsonData)

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return res.status(400).json({ error: "Invalid file format or empty data" })
    }

    // FETCH: User currently logged in
    const loggedInUser = req.user
    if (!loggedInUser || !loggedInUser.organization) {
      return res.status(400).json({ error: "User's organization is missing" })
    }

    console.log("Logged-in User's Organization:", loggedInUser.organization)

    // Validate Users
    const users = jsonData
    const invalidUsers = users
      .map((user, index) => {
        const missingFields = []
        const invalidFields = []

        // Check for missing fields
        if (!user.firstname) missingFields.push("firstname")
        if (!user.lastname) missingFields.push("lastname")
        if (!user.email) missingFields.push("email")
        if (!user.password) missingFields.push("password")
        if (!user.studentId) missingFields.push("studentId")

        // Check if firstname and lastname contain only letters
        if (user.firstname && !containsOnlyLetters(user.firstname)) {
          invalidFields.push("firstname (must contain only letters)")
        }
        if (user.lastname && !containsOnlyLetters(user.lastname)) {
          invalidFields.push("lastname (must contain only letters)")
        }

        if (missingFields.length > 0 || invalidFields.length > 0) {
          return {
            index,
            email: user.email || "No Email",
            name: `${user.firstname || "Unknown"} ${user.lastname || "User"}`,
            missingFields,
            invalidFields,
          }
        }
        return null
      })
      .filter(Boolean)

    if (invalidUsers.length > 0) {
      return res.status(400).json({
        error: "Some users have validation errors.",
        invalidUsers,
      })
    }

    // CHECK: duplicates for both email and studentId
    const emails = users.map((user) => user.email)
    const studentIds = users.map((user) => user.studentId)

    // Find users with duplicate emails
    const existingEmailUsers = await User.find({ email: { $in: emails } })

    // Find users with duplicate studentIds
    const existingStudentIdUsers = await User.find({ studentId: { $in: studentIds } })

    // Combine both duplicate lists
    const existingUsers = [...existingEmailUsers]

    // Add studentId duplicates that aren't already in the list (by email)
    existingStudentIdUsers.forEach((user) => {
      if (!existingUsers.some((u) => u.email === user.email)) {
        existingUsers.push(user)
      }
    })

    if (existingUsers.length > 0) {
      // Create a list of duplicate emails and studentIds
      const duplicateEmails = existingEmailUsers.map((u) => u.email)
      const duplicateStudentIds = existingStudentIdUsers.map((u) => u.studentId)

      return res.status(409).json({
        message: "Some users already exist.",
        conflicts: existingUsers.map((u) => ({
          email: u.email,
          studentId: u.studentId,
          name: `${u.firstname} ${u.lastname}`,
        })),
        duplicateEmails,
        duplicateStudentIds,
        // Users that don't have duplicate email OR studentId
        nonDuplicates: users.filter(
          (user) => !duplicateEmails.includes(user.email) && !duplicateStudentIds.includes(user.studentId),
        ),
      })
    }

    // Assign organization and insert valid users
    const formattedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12)
        return {
          ...user,
          password: hashedPassword, // Store the hashed password
          organization: new mongoose.Types.ObjectId(loggedInUser.organization),
          role: "student",
          studentId: user.studentId || "00000",
        }
      }),
    )

    // INSERT non-duplicate users
    const newUsers = await User.insertMany(formattedUsers)

    return res.status(201).json({ message: "Users imported successfully", newUsers })
  } catch (error) {
    console.error("Error importing users:", error.message, error.stack)
    res.status(500).json({ error: error.message || "Internal Server Error" })
  }
})

export default router

