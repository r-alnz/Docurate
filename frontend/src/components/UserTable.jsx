import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { useAuthContext } from "../hooks/useAuthContext"
import DeleteAdminModal from "./DeleteAdminModal"
import EditAdminModal from "./EditAdminModal"
import InactivateModal from "./InactivateModal.jsx"
import ActivateModal from "./ActivateModal.jsx"
import ResetPasswordModal from "./ResetPasswordModal"
import { resetUserPassword, resetAdminPassword } from "../services/authService"
import { getApiUrl } from "../api.js";

const API_URL = getApiUrl("/email");

import "../index.css"
import { Mail, KeyRound, Edit, UserMinus, Building, User, UserPlus } from "lucide-react"
import ReqRemoveModal from "./ReqRemoveModal";

/**
 * UserTable Component
 * Displays a table of users with filtering, editing, and management capabilities
 * Different views and actions are available based on the current user's role
 */
const UserTable = ({ users, onEdit, onDelete, onInactivate, onActivate, suborganizations }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isReqRemoveOpen, setIsReqRemoveOpen] = useState(false);
    const [isInactivateModalOpen, setIsInactivateModalOpen] = useState(false);
    const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
    const [resetMode, setResetMode] = useState("");
    const { user: currentUser } = useAuthContext();
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [filterRole, setFilterRole] = useState("all");
    const [filterCollege, setFilterCollege] = useState("all");
    
    // State for displaying temporary notification messages
    const [message, setMessage] = useState(null)

    // State for tracking which tooltip is currently visible
    const [activeTooltip, setActiveTooltip] = useState(null)

    // ✅ Get unique colleges from users
    const uniqueColleges = [...new Set(users.map(user => user.college).filter(Boolean))];

    const [showInactive, setShowInactive] = useState(false);

    useEffect(() => {
        let updatedUsers = users;
        if (filterRole === "students") {
            updatedUsers = users.filter(user => user.role === "student");
        } else if (filterRole === "studentsUnderOrgs") {
            updatedUsers = users.filter(user => user.role === "student" && user.suborganizations?.length > 0);
        } else if (filterRole === "studentsNotUnderOrgs") {
            updatedUsers = users.filter(user => user.role === "student" && (!user.suborganizations || user.suborganizations.length === 0));
        } else if (filterRole === "organizations") {
            updatedUsers = users.filter(user => user.role === "organization");
        } else if (filterRole === "all") {
            updatedUsers = users;
        }

    // College-based filtering (Only filter if a specific college is selected)
    if (filterCollege && filterCollege !== "all") {
      updatedUsers = updatedUsers.filter((user) => user.college === filterCollege)
    }
    // Apply exclusive Active/Inactive filter
    if (showInactive) {
      updatedUsers = updatedUsers.filter(user => user.inactive === true);
    } else {
      updatedUsers = updatedUsers.filter(user => user.inactive !== true);
    }

    setFilteredUsers(updatedUsers)
  }, [users, filterRole, filterCollege, showInactive])

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

    const handleInactivate = (user) => {
      setSelectedUser(user)
      setIsInactivateModalOpen(true)
    }

    const handleActivate = (user)  => {
      setSelectedUser(user)
      setIsActivateModalOpen(true)
    }

    const handleReqRemoveClick = (user) => {
      setSelectedUser(user)
      setIsReqRemoveOpen(true)
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

    let formattedBirthdate = user.birthdate

    // If the birthdate is a Date object, format it as MM/DD/YYYY
    if (user.birthdate instanceof Date) {
      const month = String(user.birthdate.getMonth() + 1).padStart(2, "0")
      const day = String(user.birthdate.getDate()).padStart(2, "0")
      const year = user.birthdate.getFullYear()
      formattedBirthdate = `${month}/${day}/${year}`
    }

    // Prepare email data with user information
    const emailData = {
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      studentId: user.studentId,
      birthdate: formattedBirthdate, // Include birthdate for superadmin 
      role: user.role, // Include role to determine password generation logic
      // password: user.password || "Cannot decrypt password.", // Ensure password is present
    }

    console.log("📩 Sending email request:", emailData) // Debugging

    // Validate user has an email
    if (!user || !user.email) {
      setMessage({ type: "error", text: "❌ No email found for this user." })
      return
    }

    try {
      // Send API request to email service
      const response = await fetch(`${API_URL}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          studentId: user.studentId,
          birthdate: formattedBirthdate, // Include birthdate in the request
          role: user.role, // Include role in the request
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
        <div className="mb-4 flex justify-end sticky left-0">
          {/* Role filter dropdown */}
          <select
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-white text-gray-800 font-medium rounded-lg shadow-md cursor-pointer 
               transition-all duration-300 border border-gray-300 hover:border-blue-400"
          >
            <option value="all"> All Users </option>
            <option value="students"> Students </option>
            <option value="studentsUnderOrgs"> Students (Under Orgs)</option>
            <option value="studentsNotUnderOrgs">
              Students (Not Under Orgs)
            </option>
            <option value="organizations"> Organizations </option>
          </select>

          {/* College filter dropdown */}
          <select
            onChange={(e) => setFilterCollege(e.target.value)}
            className="px-4 py-2 bg-gray-500 text-white font-medium rounded-lg ml-4 
               shadow-md cursor-pointer transition-all duration-300 
               border hover:bg-gray-600 "
          >
            <option value="all">All Colleges</option>
            {uniqueColleges.map((college, index) => (
              <option key={index} value={college}>
                {college}
              </option>
            ))}
          </select>

          {/* Active/Inactive filter */}
          <button onClick={() => setShowInactive(!showInactive)} className="px-4 py-2 bg-white text-gray-800 font-medium rounded-lg shadow-md cursor-pointer ml-4
               transition-all duration-300 border border-gray-300 hover:border-blue-400">
            {showInactive ? 'Show Active' : 'Show Inactive'}
          </button>

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
              {currentUser?.role === "admin" &&
                filterRole !== "organizations" && (
                  <th scope="col" className="px-6 py-3">
                    Student ID
                  </th>
                )}

              {currentUser?.role === "admin" &&
                filterRole !== "organizations" && (
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
                  {currentUser?.role === "superadmin"
                    ? "Organization"
                    : "Suborganizations"}
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

                      {/* Badge section - fixed position */}
                      <div className="flex items-center gap-x-2">
                        <div className="flex items-center">
                          <div
                            className={`role-badge px-2 py-rounded-full text-sm font-semibold capitalize ${user.role === "organization"
                              ? "bg-[#efc85f]  text-white"
                              : "bg-[#2a9ed6]  text-white"
                              }`}
                          >
                            {user.role === "organization" ? (
                              <Building className="w-5 h-5" />
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}

                        {/* Send email icon button */}
                        {(currentUser?.role === "admin" ||
                          currentUser?.role === "superadmin") && (
                            <div className="relative">
                              <Mail
                                className="w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 text-[#1E90FF] hover:text-white dark:hover:text-white rounded-full hover:bg-[#1E90FF] dark:hover:[#1C86EE] hover:shadow-lg"
                                onClick={() => handleSendEmail(user)}
                                title="Send Email"
                                onMouseEnter={() =>
                                  setActiveTooltip(`email-${user._id}`)
                                }
                                onMouseLeave={() => setActiveTooltip(null)}
                              />
                              {activeTooltip === `email-${user._id}` && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                  Send Email
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Reset Password button (admin/superadmin only) */}
                        {(currentUser?.role === "admin" ||
                          currentUser?.role === "superadmin") && (
                            <div className="relative">
                              <KeyRound
                                className="w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 text-yellow-500 hover:text-white rounded-full hover:bg-yellow-500 dark:hover:bg-yellow-600 hover:shadow-lg"
                                onClick={() =>
                                  handleResetPasswordClick(user, user.role)
                                }
                                title="Reset Password"
                                onMouseEnter={() =>
                                  setActiveTooltip(`reset-${user._id}`)
                                }
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
                        {(currentUser?.role === "admin" ||
                          currentUser?.role === "superadmin") && (
                            <div className="relative">
                              <Edit
                                className="w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 text-gray-500 hover:text-white rounded-full hover:bg-gray-500 dark:hover:bg-gray-500 hover:shadow-lg"
                                onClick={() => handleEditClick(user)}
                                title="Edit"
                                onMouseEnter={() =>
                                  setActiveTooltip(`edit-${user._id}`)
                                }
                                onMouseLeave={() => setActiveTooltip(null)}
                              />
                              {activeTooltip === `edit-${user._id}` && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                  Edit
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Request for removal user button */}
                        {(currentUser?.role === "organization") && (
                          <div className="relative">
                            <UserMinus
                              className="w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 text-red-500 hover:text-white rounded-full hover:bg-red-500 dark:hover:bg-red-600 hover:shadow-lg"
                              onClick={() => handleReqRemoveClick(user)}
                              title="Request Removal"
                              onMouseEnter={() =>
                                setActiveTooltip(`Removal-${user._id}`)
                              }
                              onMouseLeave={() => setActiveTooltip(null)}
                            />
                            {activeTooltip === `Removal-${user._id}` && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                Request Removal
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Show Inactivate or Delete button based on user's status */}
                        {(currentUser?.role === "admin" || currentUser?.role === "superadmin") && (
                          <div className="relative">
                            {user.inactive ? (
                              <div className="flex">

                              {/* // Show DELETE if user is already inactive */}
                              <UserMinus
                                className="w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 text-red-500 hover:text-white rounded-full hover:bg-red-500 dark:hover:bg-red-600 hover:shadow-lg"
                                onClick={() => handleDeleteClick(user)}
                                title="Delete User"
                                onMouseEnter={() => setActiveTooltip(`delete-${user._id}`)}
                                onMouseLeave={() => setActiveTooltip(null)}
                              />

                              {/* // Show RESTORE if user is already inactive */}
                              <UserPlus
                                className="ml-1 w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 text-green-500 hover:text-white rounded-full hover:bg-green-500 dark:hover:bg-green-600 hover:shadow-lg"
                                onClick={() => handleActivate(user)}
                                title="Activate User"
                                onMouseEnter={() => setActiveTooltip(`activate-${user._id}`)}
                                onMouseLeave={() => setActiveTooltip(null)}
                              />
                              </div>
                              
                            ) : (
                              // Show INACTIVATE if user is still active
                              <UserMinus
                                className="w-5 h-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 text-red-500 hover:text-white rounded-full hover:bg-red-500 dark:hover:bg-red-600 hover:shadow-lg"
                                onClick={() => handleInactivate(user)}
                                title="Mark as Inactive"
                                onMouseEnter={() => setActiveTooltip(`inactive-${user._id}`)}
                                onMouseLeave={() => setActiveTooltip(null)}
                              />
                            )}

                            {/* Tooltip display */}
                            {activeTooltip === `inactive-${user._id}` && !user.inactive && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                Inactivate
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            )}

                            {activeTooltip === `delete-${user._id}` && user.inactive && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                Delete
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            )}

                            {activeTooltip === `activate-${user._id}` && user.inactive && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                Activate
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            )}
                          </div>
                        )}

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

                  {currentUser?.role === "superadmin" ? (
                    <td className="px-6 py-4">{user.position || "N/A"}</td>
                  ) : null}

                  {/* Student-specific columns for admin users - Updated to show N/A for organizations */}
                  {currentUser?.role === "admin" &&
                    filterRole !== "organizations" && (
                      <td className="px-6 py-4">
                        {user.role === "student"
                          ? user.studentId || "N/A"
                          : user.role === "organization"
                            ? "N/A"
                            : ""}
                      </td>
                    )}

                  {currentUser?.role === "admin" &&
                    filterRole !== "organizations" && (
                      <>
                        <td className="px-6 py-4">
                          {user.role === "student"
                            ? user.college || "N/A"
                            : user.role === "organization"
                              ? "N/A"
                              : ""}
                        </td>
                        <td className="px-6 py-4">
                          {user.role === "student"
                            ? user.program || "N/A"
                            : user.role === "organization"
                              ? "N/A"
                              : ""}
                        </td>
                      </>
                    )}
                  {/* Organization/Suborganization column based on user role */}
                  {currentUser?.role === "superadmin" ? (
                    <td className="px-6 py-4">{user.organization?.name || "N/A"}</td>
                  ) : currentUser?.role === "organization" ? (
                    <td className="px-6 py-4"></td>
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

      {isInactivateModalOpen && (
        <InactivateModal
          isOpen={isInactivateModalOpen}
          user={selectedUser}
          onClose={() => setIsInactivateModalOpen(false)}
          onInactivate={onInactivate}
        />
      )}

      {isActivateModalOpen && (
        <ActivateModal
          isOpen={isActivateModalOpen}
          user={selectedUser}
          onClose={() => setIsActivateModalOpen(false)}
          onActivate={onActivate}
        />
      )}

      {isReqRemoveOpen && (
        <ReqRemoveModal
          isOpen={isReqRemoveOpen}
          removing={selectedUser}
          onClose={() => setIsReqRemoveOpen(false)}
          onSubmit={handleReqRemoveClick}
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
            <span className="font-medium mr-2">
              {message.type === "success" ? "✅" : "❌"}
            </span>
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
          onResetPassword={
            resetMode === "admin" ? resetAdminPassword : resetUserPassword
          }
        />
      )}
    </div>
  );
}

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  suborganizations: PropTypes.array,
}

export default UserTable

