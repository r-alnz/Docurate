import { useState, useEffect } from "react"
import UserTable from "../components/UserTable"
import AddAdminModal from "../components/AddAdminModal"
import {
    fetchAdminAccounts,
    addAdminAccount,
    editAdminAccount,
    deleteAdminAccount,
} from "../services/superAdminService"
import { useAuthContext } from "../hooks/useAuthContext"
import { useUserContext } from "../hooks/useUserContext"
import { Search, UserPlus } from "lucide-react"

const SuperAdminAdminsPage = () => {
    const { token } = useAuthContext()
    const { users, dispatch } = useUserContext()
    const [filteredUsers, setFilteredUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false)

    useEffect(() => {
        if (users.length === 0) {
            const loadUsers = async () => {
                try {
                    const data = await fetchAdminAccounts(token)
                    dispatch({ type: "SET_USERS", payload: data.admins })
                } catch (error) {
                    console.error("Failed to fetch users:", error)
                }
            }

            loadUsers()
        }
    }, [token, dispatch, users.length])

    useEffect(() => {
        setFilteredUsers(users)
    }, [users])

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase()
        setSearchQuery(query)

        const filtered = users.filter(
            (user) =>
                `${user.firstname} ${user.lastname}`.toLowerCase().includes(query) ||
                (user.organization?.name || "").toLowerCase().includes(query),
        )
        setFilteredUsers(filtered)
    }

    const handleAddAdmin = async (userDetails) => {
        try {
            const newUser = await addAdminAccount(token, userDetails)
            dispatch({ type: "ADD_USER", payload: newUser.user })
            setIsAddAdminModalOpen(false)
        } catch (error) {
            console.error("Failed to add user:", error)
        }
    }

    const handleEditAdmin = async (userId, updatedData) => {
        try {
            await editAdminAccount(token, userId, updatedData)
            dispatch({
                type: "SET_USERS",
                payload: users.map((user) => (user._id === userId ? { ...user, ...updatedData } : user)),
            })
        } catch (error) {
            console.error("Failed to update user:", error)
        }
    }

    const handleDeleteAdmin = async (userId) => {
        try {
            await deleteAdminAccount(token, userId)
            dispatch({
                type: "SET_USERS",
                payload: users.filter((user) => user._id !== userId),
            })
        } catch (error) {
            console.error("Failed to delete user:", error)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Admins</h1>

            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-1/3">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <button
                        onClick={() => setIsAddAdminModalOpen(true)}
                        className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <UserPlus size={20} className="mr-2" />
                        Add Admin
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <UserTable users={filteredUsers} onEdit={handleEditAdmin} onDelete={handleDeleteAdmin} />
                </div>
            </div>

            <AddAdminModal
                isOpen={isAddAdminModalOpen}
                onClose={() => setIsAddAdminModalOpen(false)}
                onSubmit={handleAddAdmin}
            />
        </div>
    )
}

export default SuperAdminAdminsPage

