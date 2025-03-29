"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { useAuthContext } from "../hooks/useAuthContext"
import DeleteAdminModal from "./DeleteAdminModal"
import EditAdminModal from "./EditAdminModal"
import ResetPasswordModal from "./ResetPasswordModal"
import { resetUserPassword, resetAdminPassword } from "../services/authService"

import "../index.css"
import { Mail, KeyRound, Edit, UserMinus } from "lucide-react"

/**
 * UserTable Component
 * Displays a table of users with filtering, editing, and management capabilities
 * Different views and actions are available based on the current user's role
 */
const UserTable = ({ users, onEdit, onDelete, suborganizations }) => {
    // State for managing selected user and modal visibility
    const [selectedUser, setSelectedUser] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isResetModalOpen, setIsResetModalOpen] = useState(false)
    const [resetMode, setResetMode] = useState("")

    // Get current user from auth context for permission-based UI
    const { user: currentUser } = useAuthContext()

    // State for filtering and displaying users
    const [filteredUsers, setFilteredUsers] = useState(users)
    const [filterRole, setFilterRole] = useState("all")
    const [filterCollege, setFilterCollege] = useState("all")

    // State for displaying temporary notification messages
    const [message, setMessage] = useState(null)

    // State for tracking which tooltip is currently visible
    const [activeTooltip, setActiveTooltip] = useState(null)

    // Extract unique colleges from users for the college filter dropdown
    const uniqueColleges = [...new Set(users.map((user) => user.college).filter(Boolean))]

    // Filter users based on selected role and college filters
    useEffect(() => {
        let updatedUsers = users

        // Role-based filtering
        if (filterRole === "students") {
            updatedUsers = users.filter((user) => user.role === "student")
        } else if (filterRole === "studentsUnderOrgs") {
            updatedUsers = users.filter((user) => user.role === "student" && user.suborganizations?.length > 0)
        } else if (filterRole === "studentsNotUnderOrgs") {
            updatedUsers = users.filter(
                (user) => user.role === "student" && (!user.suborganizations || user.suborganizations.length === 0),
            )
        } else if (filterRole === "organizations") {
            updatedUsers = users.filter((user) => user.role === "organization")
        } else if (filterRole === "all") {
            updatedUsers = users
        }

        // College-based filtering (Only filter if a specific college is selected)
        if (filterCollege && filterCollege !== "all") {
            updatedUsers = updatedUsers.filter((user) => user.college === filterCollege)
        }

        setFilteredUsers(updatedUsers)
    }, [users, filterRole, filterCollege])

    // Handler functions for user actions
    const handleEditClick = (user) => {
        console.log("Edit button clicked!")
        setSelectedUser(user)
        setIsEditModalOpen(true)
    }

    const handleDeleteClick = (user) => {
        setSelectedUser(user)
        setIsDeleteModalOpen(true)
    }

    const handleResetPasswordClick = (user, mode) => {
        setSelectedUser(user)
        setResetMode(mode)
        setIsResetModalOpen(true)
    }

    // Auto-dismiss notification messages after 3 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000) // Clear message after 3 seconds
            return () => clearTimeout(timer)
        }
    }, [message])

    // Function to send email to a user with their credentials
    const handleSendEmail = async (user) => {
        // Prepare email data with user information
        const emailData = {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            password: user.password || "Cannot decrypt password.", // Ensure password is present
        }

        console.log("📩 Sending email request:", emailData) // Debugging

        // Validate user has an email
        if (!user || !user.email) {
            setMessage({ type: "error", text: "❌ No email found for this user." })
            return
        }

        try {
            // Send API request to email service
            const response = await fetch("http://localhost:8000/api/email/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    password: user.password,
                }),
            })

            const data = await response.json()

            // Display success or error message based on response
            if (response.ok) {
                setMessage({ type: "success", text: `✅ Email sent to ${user.email}` })
            } else {
                setMessage({ type: "error", text: `❌ Error: ${data.error}` })
            }
        } catch (error) {
            console.error("Error sending email:", error)
            setMessage({ type: "error", text: "❌ Failed to send email." })
        }
    }

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
            {/* Filter controls - only visible to admin users */}
            {currentUser?.role === "admin" && (
                <div className="mb-4 flex justify-end">
                    {/* Role filter dropdown */}
                    <select
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-300 to-blue-400 text-white font-semibold rounded-lg shadow-md cursor-pointer transition duration-300 hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="all" className="text-gray-800">
                            🌎 All Users
                        </option>
                        <option value="students" className="text-gray-800">
                            🎓 Students
                        </option>
                        <option value="studentsUnderOrgs" className="text-gray-800">
                            🏛️ Students (Under Orgs)
                        </option>
                        <option value="studentsNotUnderOrgs" className="text-gray-800">
                            📚 Students (Not Under Orgs)
                        </option>
                        <option value="organizations" className="text-gray-800">
                            🏢 Organizations
                        </option>
                    </select>

                    {/* College filter dropdown */}
                    <select
                        onChange={(e) => setFilterCollege(e.target.value)}
                        className="p-2 bg-green-500 text-white rounded-md ml-4"
                    >
                        <option value="all">All Colleges</option>
                        {uniqueColleges.map((college, index) => (
                            <option key={index} value={college}>
                                {college}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Table with animation on filter change */}
            <motion.div
                key={filterRole}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* User data table */}
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                #
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Full Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Email
                            </th>
                            {/* Conditional column for birthdate (not shown for organizations) */}
                            {filterRole !== "organizations" && (
                                <th scope="col" className="px-6 py-3">
                                    Birthdate
                                </th>
                            )}

                            {/* Dynamic column header based on user role hidden
                            <th scope="col" className="px-6 py-3">
                                {currentUser?.role === "superadmin" ? "Position" : "Role"}
                            </th> */}

                            {/* Fixed Dynamic column header based on user role */}
                            {currentUser?.role === "superadmin" && (
                                <th scope="col" className="px-6 py-3">
                                    Position
                                </th>
                            )}

                            {/* Student-specific columns for admin users */}
                            {currentUser?.role === "admin" && filterRole !== "organizations" && (
                                <th scope="col" className="px-6 py-3">
                                    Student ID
                                </th>
                            )}

                            {currentUser?.role === "admin" && filterRole !== "organizations" && (
                                <>
                                    <th scope="col" className="px-6 py-3">
                                        College
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Program
                                    </th>
                                </>
                            )}

                            {/* Organization/Suborganization column based on user role */}
                            {currentUser?.role !== "organization" && (
                                <th scope="col" className="px-6 py-3">
                                    {currentUser?.role === "superadmin" ? "Organization" : "Suborganizations"}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Display filtered users or "No users found" message */}
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user, index) => (
                                <tr
                                    key={user._id}
                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex gap-x-6 justify-between items-center">
                                            <div className="font-semibold ">
                                                {user.firstname} {user.lastname}
                                            </div>
                                            <div className="flex items-center gap-x-1">
                                                {/* Badge showing user role */}
                                                <div className={`role-badge ${user.role}`}>{user.role}</div>
                                                {user.position && <div className={`role-badge ${user.position}`}>{user.position}</div>}

                                                {/* Action buttons */}
                                                {/* Send email icon button */}
                                                <div className="relative">
                                                    <Mail
                                                        className="w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:text-white dark:hover:text-white rounded-full hover:bg-green-500 dark:hover:bg-green-600 hover:shadow-lg"
                                                        onClick={() => handleSendEmail(user)}
                                                        title="Send Email"
                                                        onMouseEnter={() => setActiveTooltip(`email-${user._id}`)}
                                                        onMouseLeave={() => setActiveTooltip(null)}
                                                    />
                                                    {activeTooltip === `email-${user._id}` && (
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                                            Send Email
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Reset Password button (admin/superadmin only) */}
                                                {(currentUser?.role === "admin" || currentUser?.role === "superadmin") && (
                                                    <div className="relative">
                                                        <KeyRound
                                                            className="w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:text-white dark:hover:text-white rounded-full hover:bg-yellow-500 dark:hover:bg-yellow-600 hover:shadow-lg"
                                                            onClick={() => handleResetPasswordClick(user, user.role)}
                                                            title="Reset Password"
                                                            onMouseEnter={() => setActiveTooltip(`reset-${user._id}`)}
                                                            onMouseLeave={() => setActiveTooltip(null)}
                                                        />
                                                        {activeTooltip === `reset-${user._id}` && (
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                                                Reset Password
                                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Edit user button */}
                                                <div className="relative">
                                                    <Edit
                                                        className="w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:text-white dark:hover:text-white rounded-full hover:bg-blue-500 dark:hover:bg-blue-600 hover:shadow-lg"
                                                        onClick={() => handleEditClick(user)}
                                                        title="Edit"
                                                        onMouseEnter={() => setActiveTooltip(`edit-${user._id}`)}
                                                        onMouseLeave={() => setActiveTooltip(null)}
                                                    />
                                                    {activeTooltip === `edit-${user._id}` && (
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                                            Edit
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Mark user as inactive button */}
                                                <div className="relative">
                                                    <UserMinus
                                                        className="w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:text-white dark:hover:text-white rounded-full hover:bg-red-500 dark:hover:bg-red-600 hover:shadow-lg"
                                                        onClick={() => handleDeleteClick(user)}
                                                        title="Mark as Inactive"
                                                        onMouseEnter={() => setActiveTooltip(`inactive-${user._id}`)}
                                                        onMouseLeave={() => setActiveTooltip(null)}
                                                    />
                                                    {activeTooltip === `inactive-${user._id}` && (
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                                            Mark as Inactive
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>

                                    {/* Conditional birthdate column */}
                                    {filterRole !== "organizations" && (
                                        <td className="px-6 py-4">
                                            {user.birthdate
                                                ? new Date(user.birthdate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                })
                                                : "N/A"}
                                        </td>
                                    )}

                                    {/* Role/Position column based on current user's role   hidden */}
                                    {/* {currentUser?.role === "admin" ? (
                                        <td className="px-6 py-4">{user.role}</td>
                                    ) : currentUser?.role === "superadmin" ? (
                                        <td className="px-6 py-4">{user.position || "N/A"}</td>
                                    ) : null} */}

                                    {currentUser?.role === "superadmin" ? <td className="px-6 py-4">{user.position || "N/A"}</td> : null}

                                    {/* Student-specific columns for admin users - Updated to show N/A for organizations */}
                                    {currentUser?.role === "admin" && filterRole !== "organizations" && (
                                        <td className="px-6 py-4">
                                            {user.role === "student" ? user.studentId || "N/A" : user.role === "organization" ? "N/A" : ""}
                                        </td>
                                    )}

                                    {currentUser?.role === "admin" && filterRole !== "organizations" && (
                                        <>
                                            <td className="px-6 py-4">
                                                {user.role === "student" ? user.college || "N/A" : user.role === "organization" ? "N/A" : ""}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.role === "student" ? user.program || "N/A" : user.role === "organization" ? "N/A" : ""}
                                            </td>
                                        </>
                                    )}

                                    {/* Organization/Suborganization column based on user role */}
                                    {currentUser?.role === "superadmin" ? (
                                        <td className="px-6 py-4">{user.organization?.name || "N/A"}</td>
                                    ) : (
                                        <td className="px-6 py-4">
                                            {user.suborganizations?.length > 0
                                                ? user.suborganizations.map((suborgs) => `${suborgs.firstname} ${suborgs.lastname}`).join(", ")
                                                : "N/A"}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Modal components for user actions */}
            {/* Delete user modal */}
            {isDeleteModalOpen && (
                <DeleteAdminModal
                    isOpen={isDeleteModalOpen}
                    user={selectedUser}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDelete={onDelete}
                />
            )}

            {/* Edit user modal */}
            {isEditModalOpen && (
                <EditAdminModal
                    isOpen={isEditModalOpen}
                    user={selectedUser}
                    suborganizations={suborganizations}
                    onClose={() => setIsEditModalOpen(false)}
                    onEdit={onEdit}
                />
            )}

            {/* Temporary notification message */}
            {message && (
                <div
                    className={`fixed top-20 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 ${message.type === "success"
                            ? "bg-green-100 text-green-700 border border-green-400"
                            : "bg-red-100 text-red-700 border border-red-400"
                        }`}
                >
                    <div className="flex items-center">
                        <span className="font-medium mr-2">{message.type === "success" ? "✅" : "❌"}</span>
                        {message.text}
                    </div>
                </div>
            )}

            {/* Reset password modal */}
            {isResetModalOpen && (
                <ResetPasswordModal
                    isOpen={isResetModalOpen}
                    user={selectedUser}
                    onClose={() => setIsResetModalOpen(false)}
                    onResetPassword={resetMode === "admin" ? resetAdminPassword : resetUserPassword}
                />
            )}
        </div>
    )
}

UserTable.propTypes = {
    users: PropTypes.array.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    suborganizations: PropTypes.array,
}

export default UserTable

