import { useState, useEffect } from 'react';
import UserTable from '../components/UserTable';
import AddUserModal from '../components/AddUserModal';
import { fetchUserAccounts, addUserAccount, editUserAccount, deleteUserAccount, inactivateUserAccount, activateUserAccount } from '../services/adminService'; // Use the service for users
import { useAuthContext } from '../hooks/useAuthContext';
import { useUserContext } from '../hooks/useUserContext';
import { Plus } from "lucide-react"

const AdminUsersPage = () => {
    const { user, token } = useAuthContext();
    const currUserID = user._id;
    console.log("user idd: ", currUserID);
    const { users, dispatch } = useUserContext();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const suborgAlready = [user]; // the logged-in user
    // Get current user from auth context for permission-based UI
    const { user: currentUser } = useAuthContext()
    const suborganizations = users.filter(user => user.role === "organization");

    const loadUsers = async () => {
        try {
            const data = await fetchUserAccounts(token);
            dispatch({ type: 'SET_USERS', payload: data.users });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    // Fetch users and populate context only if not already loaded
    useEffect(() => {
        if (users.length === 0) {
            loadUsers();
        }
    }, [token, dispatch, users.length]);

    // Update filtered users when the context changes
    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = users.filter((user) =>
            `${user.firstname} ${user.lastname}`.toLowerCase().includes(query) ||
            `${user.role}`.toLowerCase().includes(query) ||
            (user.organization?.name || '').toLowerCase().includes(query) ||
            `${user.studentId}`.toLowerCase().includes(query)
        );
        setFilteredUsers(filtered);
    };

    const handleAddUser = async (userDetails) => {
        try {
            await addUserAccount(token, userDetails);
            await loadUsers(); // Refresh users after adding a new one
            setIsAddUserModalOpen(false);
            console.log("User added successfully!");
        } catch (error) {
            console.error('Failed to add user:', error.message);
        }
    };

    const handleEditUser = async (userId, updatedData) => {
        if (!userId || !updatedData) {
            console.error("❌ Error: Missing user ID or form data");
            return;
        }

        // Ensure suborganizations is always a valid array
        const sanitizedData = {
            ...updatedData,
            suborganizations: Array.isArray(updatedData.suborganizations)
                ? updatedData.suborganizations.filter(id => id) // Remove undefined/null
                : [],
        };

        console.log("🔹 Sending update request for user:", userId);
        console.log("📤 Payload:", JSON.stringify(sanitizedData, null, 2));

        try {
            await editUserAccount(token, userId, sanitizedData);
            await loadUsers(); // Fetch latest users from backend after editing ✅

        } catch (error) {
            console.error("❌ Failed to update user:", error);
        }
    };


    const handleDeleteUser = async (userId) => {
        try {
            await deleteUserAccount(token, userId);
            dispatch({
                type: 'SET_USERS',
                payload: users.filter((user) => user._id !== userId),
            });
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const handleInactivateUser = async (userId) => {
        try {
            await inactivateUserAccount(token, userId);
            dispatch({
                type: 'SET_USERS',
                payload: users.map((user) => 
                    user._id === userId ? { ...user, inactive: true } : user
                ),
            });
        } catch (error) {
            console.error('Inactivation failed:', error);
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await activateUserAccount(token, userId);
            dispatch({
                type: 'SET_USERS',
                payload: users.map((user) => 
                    user._id === userId ? { ...user, inactive: false } : user
                ),
            });
        } catch (error) {
            console.error('Activation failed:', error);
        }
    };

    return (
        <div className="p-4">
            {(currentUser?.role === "organization") && (
                <h1 className="text-2xl font-bold mb-6">Officers</h1>
            )}
            {(currentUser?.role === "admin") && (
                <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
            )}


            {/* Search Bar and Add User Button */}
            <div className=" relative z-0 flex justify-between items-center mb-4">
                {(currentUser?.role === "admin") && (
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="border p-2 rounded w-1/3"
                    />
                )}
                {(currentUser?.role === "organization") && (
                    <input
                        type="text"
                        placeholder="Search Officers..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="border p-2 rounded w-1/3"
                    />
                )}

                {(currentUser?.role === "superadmin" || currentUser?.role === "admin") && (
                    <button
                        onClick={() => setIsAddUserModalOpen(true)}
                        className="flex items-center gap-2 bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#2a9ed6] transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        Add User
                    </button>
                )}
            </div>

            {/* User Table */}
            <UserTable
                users={filteredUsers}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onInactivate={handleInactivateUser}
                onActivate={handleActivateUser}
                suborganizations={suborganizations}
            />

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSubmit={handleAddUser}
                suborganizations={suborganizations} // Pass sub-orgs as prop
                suborgAlready={suborgAlready}
            />
        </div>
    );
};

export default AdminUsersPage;
