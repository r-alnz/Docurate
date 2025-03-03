import { useState } from "react";
import * as XLSX from "xlsx";

const BulkImportPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = (e) => {
            const binaryString = e.target.result;
            const workbook = XLSX.read(binaryString, { type: "binary" });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            setData(jsonData);
        };
    };

    const handleConfirmUpload = async () => {
        if (data.length === 0) {
            alert("No data to import. Please upload a file first.");
            return;
        }

        const confirmUpload = window.confirm("Are you sure you want to upload this data?");
        if (!confirmUpload) return;

        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem("authToken");
            console.log("Retrieved Token:", token); // ✅ Debugging

            if (!token) {
                alert("No authentication token found. Please log in again.");
                return;
            }

            const response = await fetch("http://localhost:8000/api/import/bulk-import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data),
                credentials: "include",
            });

            const result = await response.json();
            console.log("Server Response:", result); // ✅ Log full response

            if (!response.ok) {
                if (response.status === 409 && result.conflicts) {
                    // 🚨 Handle duplicate users (conflicts found)
                    setMessage({
                        type: "error",
                        text: `Some users already exist:\n${result.conflicts
                            .map((user) => `${user.email} (${user.name})`)
                            .join(", ")}`,
                    });
                    return;
                }

                if (response.status === 400 && result.invalidUsers) {
                    // 🚨 Handle users with missing fields
                    setMessage({
                        type: "error",
                        text: `Some users are missing required fields:\n${result.invalidUsers
                            .map((user) => `For ${user.name}: Missing [${user.missingFields.join(", ")}]`)
                            .join("\n")}`,
                    });
                    return;
                }

                throw new Error(result.error || "Failed to import data");
            }

            setMessage({ type: "success", text: "Users imported successfully!" });
            setData([]); // Clear table after successful upload
        } catch (error) {
            console.error("Import error:", error); // ✅ Log error details
            setMessage({ type: "error", text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Import Users from Excel</h2>

            {/* File Upload Input */}
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="mb-4 border p-2"
            />

            {/* Display Table */}
            {data.length > 0 && (
                <div>
                    <table className="border-collapse border border-gray-400 w-full">
                        <thead>
                            <tr className="bg-gray-200">
                                {Object.keys(data[0]).map((key) => (
                                    <th key={key} className="border border-gray-400 px-4 py-2">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index} className="border border-gray-400">
                                    {Object.values(row).map((value, i) => (
                                        <td key={i} className="border border-gray-400 px-4 py-2">{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Confirm & Upload Button */}
                    <button
                        onClick={handleConfirmUpload}
                        disabled={loading}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        {loading ? "Uploading..." : "Confirm & Upload"}
                    </button>
                </div>
            )}

            {/* Message Display */}
            {message && (
                <div className={`mt-4 p-2 text-white rounded ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {message.text.split("\n").map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BulkImportPage;
