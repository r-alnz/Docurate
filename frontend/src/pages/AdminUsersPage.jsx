import { useState, useEffect } from 'react';
import UserTable from '../components/UserTable';
import AddUserModal from '../components/AddUserModal';
import { fetchUserAccounts, addUserAccount, editUserAccount, deleteUserAccount } from '../services/adminService'; // Use the service for users
import { useAuthContext } from '../hooks/useAuthContext';
import { useUserContext } from '../hooks/useUserContext';

const AdminUsersPage = () => {
    const { token } = useAuthContext();
    const { users, dispatch } = useUserContext();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);



    // Fetch users and populate context only if not already loaded
    useEffect(() => {
        if (users.length === 0) {
            const loadUsers = async () => {
                try {
                    const data = await fetchUserAccounts(token);
                    dispatch({ type: 'SET_USERS', payload: data.users });
                } catch (error) {
                    console.error('Failed to fetch users:', error);
                }
            };
    
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
            const newUser = await addUserAccount(token, userDetails);
            dispatch({
                type: 'ADD_USER',
                payload: {
                    ...newUser.user,
                    organization: {
                        _id: userDetails.organization,
                        name: userDetails.organizationName, // Include the organization name
                    },
                },
            });
            setIsAddUserModalOpen(false);
        } catch (error) {
            console.error('Failed to add user:', error.message);
        }
    };

    const handleEditUser = async (userId, updatedData) => {
            try {
                await editUserAccount(token, userId, updatedData);
                dispatch({
                    type: 'SET_USERS',
                    payload: users.map((user) =>
                        user._id === userId ? { ...user, ...updatedData } : user
                    ),
                });
            } catch (error) {
                console.error('Failed to update user:', error);
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
    

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

            {/* Search Bar and Add User Button */}
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="border p-2 rounded w-1/3"
                />
                <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Add User
                </button>
            </div>

            {/* User Table */}
            <UserTable
                users={filteredUsers}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
            />;

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSubmit={handleAddUser}
            />
        </div>
    );
};

export default AdminUsersPage;
