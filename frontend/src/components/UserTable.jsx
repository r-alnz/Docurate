import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuthContext } from "../hooks/useAuthContext";
import DeleteAdminModal from "./DeleteAdminModal";
import EditAdminModal from "./EditAdminModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { resetUserPassword, resetAdminPassword } from "../services/authService";

import "../index.css"
import { Mail } from "lucide-react";
import ReqRemoveModal from "./ReqRemoveModal";

const UserTable = ({ users, onEdit, onDelete, suborganizations }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isReqRemoveOpen, setIsReqRemoveOpen] = useState(false);
    const [resetMode, setResetMode] = useState("");
    const { user: currentUser } = useAuthContext();
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [filterRole, setFilterRole] = useState("all");
    const [filterCollege, setFilterCollege] = useState("all");
    // ✅ Get unique colleges from users
    const uniqueColleges = [...new Set(users.map(user => user.college).filter(Boolean))];


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
            updatedUsers = updatedUsers.filter(user => user.college === filterCollege);
        }

        setFilteredUsers(updatedUsers);
    }, [users, filterRole, filterCollege]);

    const handleEditClick = (user) => {
        console.log("Edit button clicked!")
        setSelectedUser(user)
        setIsEditModalOpen(true)
    }

    const handleDeleteClick = (user) => {
        setSelectedUser(user)
        setIsDeleteModalOpen(true)
    }
    
    const handleReqRemoveClick = (user) => {
        setSelectedUser(user)
        setIsReqRemoveOpen(true)
    }

    // }
    // const handleReqRemoveClick = async (formData) => {
    //     try {
    //         const response = await fetch("http://localhost:8000/api/removals/remove-request", { // Adjust the URL if necessary
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(formData),
    //         });
    
    //         const data = await response.json();
    
    //         if (!response.ok) {
    //             console.error("❌ Server Error:", data.message); // Log the response message from the backend
    //             throw new Error(data.message);
    //         }
    
    //         console.log("✅ Request submitted:", data);
    //     } catch (error) {
    //         console.error("❌ Error submitting request:", error);
    //     }
    // };
    

    const handleResetPasswordClick = (user, mode) => {
        setSelectedUser(user)
        setResetMode(mode)
        setIsResetModalOpen(true)
    }

    const handleSendEmail = async (user) => {

        const emailData = {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            password: user.password || "Cannot decrypt password.", // Ensure password is present
        };

        console.log("📩 Sending email request:", emailData); // Debugging

        if (!user || !user.email) {
            alert("❌ No email found for this user.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify({}) // No email needed since it's hardcoded in backend
                body: JSON.stringify({
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    password: user.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`✅ Email sent to ${user.email}`);
            } else {
                alert(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("❌ Failed to send email.");
        }
    };


    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
            {currentUser?.role === "admin" && (

                // Filters
                <div className="mb-4 flex justify-end">
                    <select
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-300 to-blue-400 text-white font-semibold rounded-lg shadow-md cursor-pointer transition duration-300 hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="all" className="text-gray-800">🌎 All Users</option>
                        <option value="students" className="text-gray-800">🎓 Students</option>
                        <option value="studentsUnderOrgs" className="text-gray-800">🏛️ Students (Under Orgs)</option>
                        <option value="studentsNotUnderOrgs" className="text-gray-800">📚 Students (Not Under Orgs)</option>
                        <option value="organizations" className="text-gray-800">🏢 Organizations</option>
                    </select>


                    {/* College Filter */}
                    <select
                        onChange={(e) => setFilterCollege(e.target.value)}
                        className="p-2 bg-green-500 text-white rounded-md ml-4"
                    >
                        <option value="all">All Colleges</option>
                        {uniqueColleges.map((college, index) => (
                            <option key={index} value={college}>{college}</option>
                        ))}
                    </select>

                </div>


            )}

            {/* --------------- */}
            {/* for simple animation */}
            <motion.div
                key={filterRole}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >

                {/* actual table */}
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">#</th>
                            <th scope="col" className="px-6 py-3">Full Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            {filterRole !== "organizations" &&
                                <th scope="col" className="px-6 py-3">Birthdate</th>
                            }

                            <th scope="col" className="px-6 py-3">
                                {currentUser?.role === "superadmin" ? "Position" : "Role"}
                            </th>
                            {currentUser?.role === "admin" && filterRole !== "organizations" && (
                                <th scope="col" className="px-6 py-3">Student ID</th>
                            )}

                            {currentUser?.role === "admin" && filterRole !== "organizations" && (
                                <>
                                    <th scope="col" className="px-6 py-3">College</th>
                                    <th scope="col" className="px-6 py-3">Program</th>
                                </>
                            )}

                            {/* pag superadmins, show org.
                        else, show suborganizations*/}
                            {currentUser?.role !== "organization" && (
                                <th scope="col" className="px-6 py-3">
                                    {currentUser?.role === "superadmin" ? "Organization" : "Suborganizations"}
                                </th>
                            )}

                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user, index) => (
                                <tr
                                    key={user._id}
                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex gap-x-6 justify-between items-center">
                                            <div className="font-semibold ">{user.firstname} {user.lastname}</div>
                                            <div className="flex items-center gap-x-1">
                                                <div className={`role-badge ${user.role}`}>{user.role}</div>
                                                <Mail className="w-5 h-4 " />
                                            </div>

                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>

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

                                    {currentUser?.role === "admin" ? (
                                        <td className="px-6 py-4">{user.role}</td>
                                    ) : currentUser?.role === "superadmin" ? (
                                        <td className="px-6 py-4">{user.position || "N/A"}</td>
                                    ) : (null)}

                                    {currentUser?.role === "admin" && filterRole !== "organizations" && (
                                        <td className="px-6 py-4">{user.role === "student" ? user.studentId || "N/A" : ""}</td>
                                    )}

                                    {currentUser?.role === "admin" && filterRole !== "organizations" && (
                                        <>
                                            <td className="px-6 py-4">{user.role === "student" ? user.college || "N/A" : ""}</td>
                                            <td className="px-6 py-4">{user.role === "student" ? user.course || "N/A" : ""}</td>
                                        </>
                                    )}


                                    {currentUser?.role === "superadmin" ? (
                                        <td className="px-6 py-4">{user.organization?.name || "N/A"}</td>
                                    ) : (
                                        <td className="px-6 py-4">
                                            {user.suborganizations?.length > 0
                                                ? user.suborganizations.map(suborgs => `${suborgs.firstname} ${suborgs.lastname}`).join(", ")
                                                : "N/A"}
                                        </td>
                                    )}

                                    <td className="px-6 py-4">
                                        <div className="flex gap-5">
                                            {(currentUser?.role === "admin" || currentUser?.role === "superadmin") && (
                                                <button
                                                    className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline"
                                                    onClick={() => handleResetPasswordClick(user, user.role)}
                                                >
                                                    Reset Password
                                                </button>
                                            )}
                                            <button
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="font-medium text-red-600 dark:text-red-500 hover:underline"
                                                onClick={() => handleDeleteClick(user)}
                                            >
                                                Inactive
                                            </button>
                                            <button className="font-medium text-green-600 dark:text-green-500 hover:underline"
                                                onClick={() => handleSendEmail(user)}>
                                                Send Email
                                            </button>

                                            {/* temporary for request remove */}
                                            <button className="font-medium text-red-600 dark:text-red-500 hover:underline"
                                            onClick={() => handleReqRemoveClick(user)}>
                                                rekwes remob
                                            </button>
                                        </div>
                                    </td>
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
            {/* --------------- */}

            {isDeleteModalOpen && (
                <DeleteAdminModal
                    isOpen={isDeleteModalOpen}
                    user={selectedUser}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDelete={onDelete}
                />
            )}

            {isEditModalOpen && (
                <EditAdminModal
                    isOpen={isEditModalOpen}
                    user={selectedUser}
                    suborganizations={suborganizations}
                    onClose={() => setIsEditModalOpen(false)}
                    onEdit={onEdit}
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
}

export default UserTable