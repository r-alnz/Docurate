import XLSX from "xlsx";
import User from "../models/userModel";
import mongoose from "mongoose";

export const uploadExcel = async (req, res) => {
    console.log("🚀 uploadExcel function started");

    try {
        if (!req.file) {
            console.log("❌ No file uploaded");
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("📂 File received:", req.file);

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const usersData = XLSX.utils.sheet_to_json(sheet);

        console.log("📊 Parsed users data:", usersData);

        const convertExcelDate = (excelDate) => {
            if (!excelDate || isNaN(excelDate)) return null; // Handle invalid data
            const date = new Date((excelDate - 25569) * 86400000);
            return date.toISOString().split("T")[0]; // Converts to YYYY-MM-DD
        };

        const users = usersData.map((row) => ({
            firstname: row.firstname,
            lastname: row.lastname,
            email: row.email,
            password: row.password, // No need to hash manually!
            organization: mongoose.Types.ObjectId.isValid(row.organization)
                ? new mongoose.Types.ObjectId(row.organization)
                : null,
            role: row.role || "student",
            studentId: row.studentId || null,
            birthdate: convertExcelDate(row.birthdate), // ✅ Add birthdate conversion
        }));

        console.log("📝 Final users array (before saving):", users);
        
        // Insert users - password will be hashed automatically due to .pre('save')
        await User.insertMany(users);

        res.json({ message: "Users imported successfully!" });
    } catch (error) {
        console.error("❌ Error importing Excel:", error);
        res.status(500).json({ error: "Failed to import users" });
    }
};