import { useState, useEffect } from 'react';
import OrgUserTable from '../components/OrgUserTable';
import AddUserModal from '../components/AddUserModal';
import { fetchUserAccounts, addUserAccount, editUserAccount, deleteUserAccount } from '../services/adminService'; // Use the same service
import { useAuthContext } from '../hooks/useAuthContext';
import { useUserContext } from '../hooks/useUserContext';

const OrgUsersPage = () => {
    const { token, user } = useAuthContext(); // Get the logged-in org user
    const { users, dispatch } = useUserContext();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    // const suborganizations = users.filter(user => user.role === "organization");

    const loadUsers = async () => {
      try {
        console.log("You are at OrgUsersPage");
        console.log("role: ", user.role, "\nid: ", user._id);
        const data = await fetchUserAccounts(token, user.role, user._id);
          
          dispatch({ type: 'SET_USERS', payload: data.users }); // No need to filter here!
      } catch (error) {
          console.error('Failed to fetch users:', error);
      }
  };
  
    
  //   const loadUsers = async () => {
  //     const orgUserId = user?._id; 
  //     console.log(orgUserId);
  //     try {
  //         const data = await fetchUserAccounts(token);
  
  //         // Get the ID of the logged-in organization user
  //         const orgUserId = user?._id; 
  
  //         // Filter students whose `suborganizations` array contains this org's user ID
  //         const subOrgUsers = data.users.filter(u => 
  //             u.role === 'student' && u.suborganizations.includes(orgUserId)
  //         );
  
  //         dispatch({ type: 'SET_USERS', payload: subOrgUsers });
  //     } catch (error) {
  //         console.error('Failed to fetch users:', error);
  //     }
  // };  
  

    useEffect(() => {
        if (users.length === 0) {
            loadUsers();
        }
    }, [token, dispatch, users.length]);

    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = users.filter((user) =>
            `${user.firstname} ${user.lastname}`.toLowerCase().includes(query) ||
            `${user.role}`.toLowerCase().includes(query) ||
            `${user.studentId}`.toLowerCase().includes(query)
        );
        setFilteredUsers(filtered);
    };

    const handleAddUser = async (userDetails) => {
        try {
            await addUserAccount(token, userDetails);
            await loadUsers();
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
            <h1 className="text-2xl font-bold mb-6">Manage Your Organization's Users</h1>

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
            <OrgUserTable
                users={filteredUsers}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                // suborganizations={suborganizations}
            />

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSubmit={handleAddUser}
            />
        </div>
    );
};

export default OrgUsersPage;