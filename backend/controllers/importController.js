import XLSX from "xlsx";
import User from "../models/userModel";
import mongoose from "mongoose";

export const uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Read the uploaded Excel file
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0]; // Get first sheet
        const sheet = workbook.Sheets[sheetName];
        const usersData = XLSX.utils.sheet_to_json(sheet); // Convert to JSON

        // Map and validate data before inserting into MongoDB
        // const users = usersData.map((row) => ({
        //     firstname: row.firstname,
        //     lastname: row.lastname,
        //     email: row.email,
        //     password: row.password, // Consider hashing if not hashed
        //     organization: new mongoose.Types.ObjectId(row.organization),
        //     role: row.role,
        // }));

        // await User.insertMany(users); // Bulk insert
        await User.insertMany(usersData); // Directly insert raw data

        res.json({ message: "Users imported successfully!" });
    } catch (error) {
        console.error("Error importing Excel:", error);
        res.status(500).json({ error: "Failed to import users" });
    }
};
