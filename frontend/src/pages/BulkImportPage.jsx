import { useState } from "react"
import * as XLSX from "xlsx"
import { fetchUserAccounts } from "../services/adminService"
import { useUserContext } from "../hooks/useUserContext"
import { getToken } from "../utils/authUtil"
import { getApiUrl } from "../api.js"

const API_URL = getApiUrl("/import")
// const API_URL = "https://docurate.onrender.com/api/import"

const BulkImportPage = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const { dispatch } = useUserContext()

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showAlertModal, setShowAlertModal] = useState(false)
    const [modalContent, setModalContent] = useState({ title: "", message: "", onConfirm: null })

    const loadUsers = async () => {
        try {
            const data = await fetchUserAccounts(getToken())
            console.log(data.users)
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

            // Convert Excel to JSON with missing values set to `null`
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null })

            // Remove empty columns dynamically
            if (jsonData.length > 0) {
                const validKeys = Object.keys(jsonData[0]).filter((key) => jsonData.some((row) => row[key] !== null))

                const filteredData = jsonData.map((row) => {
                    const newRow = {}
                    validKeys.forEach((key) => {
                        if (key.toLowerCase().includes("birthdate") && row[key]) {
                            newRow[key] = excelDateToISO(row[key]) // Convert birthdate format
                        } else {
                            newRow[key] = row[key]
                        }
                    })
                    return newRow
                })

                setData(filteredData)
            } else {
                setData([])
            }
        }
    }

    const showAlert = (title, message) => {
        setModalContent({ title, message })
        setShowAlertModal(true)
    }

    const showConfirm = (title, message, onConfirm) => {
        setModalContent({ title, message, onConfirm })
        setShowConfirmModal(true)
    }

    const initiateUpload = () => {
        if (data.length === 0) {
            showAlert("No Data", "No data to import. Please upload a file first.")
            return
        }

        // Check if any of the required fields are empty
        for (let i = 0; i < data.length; i++) {
            const row = data[i]
            const requiredFields = [
                "firstname",
                "lastname",
                "email",
                "studentId",
                "birthdate",
                "college",
                "program",
                "password",
            ] // Modify this list as per your requirements
            for (const field of requiredFields) {
                if (!row[field]) {
                    showAlert("Validation Error", `Row ${i + 1}: The field "${field}" cannot be empty.`)
                    return
                }
            }
        }

        showConfirm("Confirm Upload", "Are you sure you want to upload this data?", handleConfirmUpload)
    }

    const excelDateToISO = (excelDate) => {
        if (!excelDate || isNaN(excelDate)) return null // Handle empty or invalid dates
        const date = new Date((excelDate - 25569) * 86400000) // Convert Excel serial number to JS date
        return date.toISOString().split("T")[0] // Format as YYYY-MM-DD
    }

    const handleConfirmUpload = async () => {
        setLoading(true)
        setMessage(null)

        try {
            const token = localStorage.getItem("authToken")
            console.log("Retrieved Token:", token)

            if (!token) {
                showAlert("Authentication Error", "No authentication token found. Please log in again.")
                setLoading(false)
                return
            }

            const formData = new FormData()
            formData.append("file", document.querySelector('input[type="file"]').files[0])

            const response = await fetch(`${API_URL}/bulk-import`, {
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
                    // 🚨 Handle duplicate users (email or studentId)
                    let conflictMessage = "Some users already exist:\n"

                    result.conflicts.forEach((user) => {
                        let duplicateInfo = `${user.name} - `

                        if (result.duplicateEmails && result.duplicateEmails.includes(user.email)) {
                            duplicateInfo += `Email: ${user.email}`
                        }

                        if (result.duplicateStudentIds && result.duplicateStudentIds.includes(user.studentId)) {
                            if (duplicateInfo.includes("Email")) {
                                duplicateInfo += `, `
                            }
                            duplicateInfo += `Student ID: ${user.studentId}`
                        }

                        conflictMessage += `\n${duplicateInfo}`
                    })

                    conflictMessage += "\n\nDo you want to skip these and upload the rest?"

                    if (result.nonDuplicates && result.nonDuplicates.length === 0) {
                        showAlert("All Users Exist", "All users already exist in the system.")
                        setLoading(false)
                        return
                    }

                    showConfirm("Duplicate Users", conflictMessage, async () => {
                        if (result.nonDuplicates && result.nonDuplicates.length > 0) {
                            // Process non-duplicate users
                            const ws = XLSX.utils.json_to_sheet(result.nonDuplicates)
                            const wb = XLSX.utils.book_new()
                            XLSX.utils.book_append_sheet(wb, ws, "NonDuplicates")

                            const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
                            const blob = new Blob([wbout], {
                                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            })
                            const nonDuplicatesFile = new File([blob], "non_duplicates.xlsx", { type: blob.type })

                            const newFormData = new FormData()
                            newFormData.append("file", nonDuplicatesFile)

                            try {
                                const retryResponse = await fetch(`${API_URL}/bulk-import`, {
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
                            } catch (error) {
                                console.error("Retry import error:", error)
                                setMessage({ type: "error", text: error.message })
                            }
                        }
                    })
                    setLoading(false)
                    return
                }
            }

            if (response.ok) {
                setMessage({ type: "success", text: "Users imported successfully!" })
                setData([]) // Clear table after successful upload
                loadUsers() // Refresh the user list
                setLoading(false)
                return
            }
        } catch (error) {
            console.error("Upload error:", error)
            setMessage({ type: "error", text: error.message })
            setLoading(false)
        }
        setLoading(false)
    }

    // Modal components
    const AlertModal = () => {
        if (!showAlertModal) return null

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-bold mb-2">{modalContent.title}</h3>
                    <div className="mb-4 whitespace-pre-line">{modalContent.message}</div>
                    <div className="flex justify-end">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setShowAlertModal(false)}>
                            OK
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const ConfirmModal = () => {
        if (!showConfirmModal) return null

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-bold mb-2">{modalContent.title}</h3>
                    <div className="mb-4 whitespace-pre-line">{modalContent.message}</div>
                    <div className="flex justify-end space-x-2">
                        <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowConfirmModal(false)}>
                            Cancel
                        </button>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => {
                                setShowConfirmModal(false)
                                if (modalContent.onConfirm) modalContent.onConfirm()
                            }}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        )
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

                    {/* Validation Info */}
                    <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
                        <h3 className="font-bold">Validation Rules:</h3>
                        <ul className="list-disc ml-5">
                            <li>First name and last name must contain only letters (A-Z, a-z)</li>
                            <li>Email addresses must be unique</li>
                            <li>Student IDs must be unique</li>
                            <li>All required fields must be filled</li>
                        </ul>
                    </div>

                    {/* Confirm & Upload Button */}
                    <button onClick={initiateUpload} disabled={loading} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
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

            {/* Modals */}
            <AlertModal />
            <ConfirmModal />
        </div>
    )
}

export default BulkImportPage
