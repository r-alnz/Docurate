import { useState } from "react"
import * as XLSX from "xlsx"
import { fetchUserAccounts } from "../services/adminService"
import { useUserContext } from "../hooks/useUserContext"
import { getToken } from "../utils/authUtil"

const BulkImportPage = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const { dispatch } = useUserContext()

    const loadUsers = async () => {
        try {
            const data = await fetchUserAccounts(getToken())
            dispatch({ type: "SET_USERS", payload: data.users })
        } catch (error) {
            console.error("Failed to fetch users:", error)
        }
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = (e) => {
            const binaryString = e.target.result
            const workbook = XLSX.read(binaryString, { type: "binary" })

            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]

            // explicitly set missing values to `null`
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null })

            // remove empty columns dynamically
            if (jsonData.length > 0) {
                const validKeys = Object.keys(jsonData[0]).filter((key) => jsonData.some((row) => row[key] !== null))

                const filteredData = jsonData.map((row) => {
                    const newRow = {}
                    validKeys.forEach((key) => (newRow[key] = row[key]))
                    return newRow
                })
                setData(filteredData)
            } else {
                setData([])
            }
        }
    }

    const handleConfirmUpload = async () => {
        if (data.length === 0) {
            alert("No data to import. Please upload a file first.")
            return
        }

        const confirmUpload = window.confirm("Are you sure you want to upload this data?")
        if (!confirmUpload) return

        setLoading(true)
        setMessage(null)

        try {
            const token = localStorage.getItem("authToken")
            console.log("Retrieved Token:", token)

            if (!token) {
                alert("No authentication token found. Please log in again.")
                return
            }

            const formData = new FormData()
            formData.append("file", document.querySelector('input[type="file"]').files[0])

            const response = await fetch("http://localhost:8000/api/import/bulk-import", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
                credentials: "include",
            })

            const result = await response.json()
            console.log("Server Response:", result)

            if (!response.ok) {
                if (response.status === 409 && result.conflicts) {
                    // 🚨 Handle duplicate users
                    const userChoice = window.confirm(
                        `Some users already exist:\n${result.conflicts
                            .map((user) => `\n${user.email} (${user.name})`)
                            .join(", ")}\n\nDo you want to skip these and upload the rest?`,
                    )

                    if (userChoice && result.nonDuplicates.length > 0) {
                        // Create a new workbook with only non-duplicate users
                        const ws = XLSX.utils.json_to_sheet(result.nonDuplicates)
                        const wb = XLSX.utils.book_new()
                        XLSX.utils.book_append_sheet(wb, ws, "NonDuplicates")

                        // Convert to blob
                        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
                        const blob = new Blob([wbout], {
                            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        })
                        const nonDuplicatesFile = new File([blob], "non_duplicates.xlsx", { type: blob.type })

                        // Create new FormData with only non-duplicates
                        const newFormData = new FormData()
                        newFormData.append("file", nonDuplicatesFile)

                        const retryResponse = await fetch("http://localhost:8000/api/import/bulk-import", {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                            body: newFormData,
                            credentials: "include",
                        })

                        const retryResult = await retryResponse.json()

                        if (!retryResponse.ok) {
                            throw new Error(retryResult.error || "Failed to import non-duplicate users")
                        }

                        setMessage({ type: "success", text: "Non-duplicate users imported successfully!" })
                        setData([]) // Clear table after successful upload
                        loadUsers() // Refresh the user list
                        return
                    }

                    setMessage({ type: "error", text: "Import aborted due to duplicate users." })
                    return
                }

                if (response.status === 400 && result.invalidUsers) {
                    // 🚨 Handle users with missing fields
                    setMessage({
                        type: "error",
                        text: `Some users are missing required fields:\n${result.invalidUsers
                            .map((user) => `For ${user.email}: Missing [${user.missingFields.join(", ")}]`)
                            .join("\n")}`,
                    })
                    return
                }

                throw new Error(result.error || "Failed to import data")
            }
            loadUsers()
            setMessage({ type: "success", text: "Users imported successfully!" })
            setData([]) // Clear table after successful upload
        } catch (error) {
            console.error("Import error:", error)
            setMessage({ type: "error", text: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Import Students</h2>

            {/* File Upload Input */}
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4 border p-2" />

            {/* Display Table */}
            {data.length > 0 && (
                <div>
                    <table className="border-collapse border border-gray-400 w-full">
                        <thead>
                            <tr className="bg-gray-200">
                                {Object.keys(data[0]).map((key) => (
                                    <th key={key} className="border border-gray-400 px-4 py-2">
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index} className="border border-gray-400">
                                    {Object.values(row).map((value, i) => (
                                        <td key={i} className="border border-gray-400 px-4 py-2">
                                            {value}
                                        </td>
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
    )
}

export default BulkImportPage

