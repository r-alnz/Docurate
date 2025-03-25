import { useOrganizationContext } from "../hooks/useOrganizationContext";
import { useAuthContext } from '../hooks/useAuthContext';
"use client"
import { useState, useEffect } from "react"
import PropTypes from "prop-types"

const EditAdminModal = ({ isOpen, user, onClose, onEdit, suborganizations }) => {
    console.log("Organizations from context:", suborganizations)

    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        role: "",
        studentId: "",
        organization: "",
        suborganizations: [],
        birthdate: "",
        college: "",
        course: "",
        position: "",
    })

    const [selectedSubOrgs, setSelectedSubOrgs] = useState([])
    const [showMessageModal, setShowMessageModal] = useState(false)
    const [handleConfirm, setHandleConfirm] = useState(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [message, setMessage] = useState({ text: "", type: "" })
    const [birthdate, setBirthdate] = useState("")
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split("T")[0]

    useEffect(() => {
        // Initialize selected suborganizations only when formData.suborganizations is available
        if (formData.suborganizations) {
            setSelectedSubOrgs([...formData.suborganizations])
        }
    }, [formData.suborganizations])

    const toggleSubOrg = (suborgId) => {
        setSelectedSubOrgs(
            (prev) =>
                prev.includes(suborgId)
                    ? prev.filter((id) => id !== suborgId) // Remove if selected
                    : [...prev, suborgId], // Add if not selected
        )
    }

    useEffect(() => {
        if (user) {
            setFormData({
                firstname: user.firstname || "",
                lastname: user.lastname || "",
                email: user.email || "",
                role: user.role || "",
                studentId: user.role === "student" ? user.studentId || "" : "",
                suborganizations: Array.isArray(user?.suborganizations)
                    ? user.suborganizations.map((suborg) => suborg._id)
                    : [],
                birthdate: user.birthdate ? user.birthdate.split("T")[0] : "",
                college: user.college || "",
                course: user.course || "",
                organization: user.organization || "",
                position: user.role === "admin" ? user.position || "" : "",
            })
        }
    }, [user])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Validation functions
    const validateName = (name) => {
        const nameRegex = /^[A-Za-z\s]+$/
        return nameRegex.test(name)
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validateAge = (birthdate) => {
        if (!birthdate) return true // Optional field
        const birthDate = new Date(birthdate)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 18
        }

        return age >= 18
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!user || !user._id) {
            console.error("❌ Error: Missing user ID")
            return
        }

        // Validate form data
        if (!validateName(formData.firstname)) {
            setMessage({ text: "❌ First name should contain only letters", type: "error" })
            return
        }

        if (!validateName(formData.lastname)) {
            setMessage({ text: "❌ Last name should contain only letters", type: "error" })
            return
        }

        if (!validateEmail(formData.email)) {
            setMessage({ text: "❌ Please enter a valid email address with @ symbol", type: "error" })
            return
        }

        if (!validateAge(formData.birthdate)) {
            setMessage({ text: "❌ User must be at least 18 years old", type: "error" })
            return
        }

        setHandleConfirm(() => async () => {
            setShowConfirmDialog(false)

            const updatedUser = {
                ...formData,
                suborganizations: selectedSubOrgs.length ? selectedSubOrgs : [],
                birthdate: formData.birthdate ? new Date(formData.birthdate).toISOString() : null,
                college: formData.college.trim(),
                course: formData.course.trim(),
                position: formData.position.trim(),
            }

            console.log("🔹 Updating user:", user._id)
            console.log("📤 Final Payload:", JSON.stringify(updatedUser, null, 2))

            try {
                // Make sure onEdit returns a promise
                const result = await onEdit(user._id, updatedUser)
                console.log("✅ Edit result:", result)

                setMessage({ text: "✅ Edit successful!", type: "success" })
                setShowMessageModal(true)

                // Close the modal after 3 seconds
                setTimeout(() => {
                    setShowMessageModal(false)
                    onClose() // ✅ Close modal only after showing success message
                }, 1000)
            } catch (error) {
                console.error("❌ Edit failed:", error)

                setMessage({ text: "❌ Edit failed. Please try again.", type: "error" })
                setShowMessageModal(true)

                setTimeout(() => setShowMessageModal(false), 1000)
            }
        })

        setShowConfirmDialog(true)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Edit User</h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700">First Name</label>
                        <input
                            type="text"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Last Name</label>
                        <input
                            type="text"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Birthdate</label>
                        <input
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                            max={maxDate} // Restrict to at least 18 years old
                        />
                    </div>

                    {user.role === "student" && (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700">Student ID</label>
                                <input
                                    type="text"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700">College</label>
                                <input
                                    type="text"
                                    name="college"
                                    value={formData.college}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700">Course</label>
                                <input
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Suborganizations</label>

                                {suborganizations.length === 0 ? (
                                    <div className="border rounded p-2 w-full text-gray-500">No suborganizations available.</div>
                                ) : (
                                    <div className="border rounded p-2 w-full h-32 overflow-y-auto">
                                        {suborganizations.map((org) => (
                                            <div
                                                key={org._id}
                                                onClick={() => toggleSubOrg(org._id)}
                                                className={`p-2 cursor-pointer ${selectedSubOrgs.includes(org._id) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
                                                    } rounded mb-1`}
                                            >
                                                {org.firstname || "(No Name)"}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {user.role === "admin" && (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700">Position</label>
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700">Organization</label>
                                <div className="w-full border p-2 rounded">{user.organization.name}</div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                            onClick={handleSubmit}
                        >
                            Save Changes
                        </button>
                    </div>

                    {showMessageModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                                <p className={`mb-4 ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>
                                    {message.text}
                                </p>
                            </div>
                        </div>
                    )}

                    {message.text && (
                        <div
                            className={`mt-4 p-2 rounded ${message.type === "success"
                                    ? "bg-green-100 text-green-700 border border-green-400"
                                    : "bg-red-100 text-red-700 border border-red-400"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {showConfirmDialog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                                <p className="text-gray-700 mb-4">Are you sure you want to save these changes?</p>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowConfirmDialog(false)}
                                        className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

EditAdminModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
}

export default EditAdminModal

