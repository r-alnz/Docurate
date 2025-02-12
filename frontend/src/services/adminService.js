import axios from 'axios';
const ADMIN_API = '/api/admin';  // Admin routes
const ORG_API = '/api/organizations'; // Organization-specific routes

export const fetchUserAccounts = async (token, userRole, orgId = null) => {
    try {
        let response;

        if (userRole === 'admin' || userRole === 'superadmin') {
            console.log("adminService: this is admin role:", userRole, "\nunder orgId:", orgId);
            // Admins and superadmins fetch all users
            response = await axios.get(`${ADMIN_API}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }
        else if (userRole === 'organization' && orgId) {
            console.log("adminService: this is organization\nid:", orgId);
            // Organizations fetch only students whose `suborganizations` include their ID
            response = await axios.get(`${ORG_API}/org-users`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { role: 'student', suborganization: orgId },
            });
        } 
        else {
            throw new Error('Unauthorized access');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Add a user account
export const addUserAccount = async (token, userDetails) => {
    console.log('📤 Sending user data:', JSON.stringify(userDetails, null, 2));

    const response = await axios.post(`${ADMIN_API}/users`, userDetails, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
};

// Edit a user account
export const editUserAccount = async (token, userId, userDetails) => {
    const response = await axios.patch(`${ADMIN_API}/users/${userId}`, userDetails, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Delete a user account
export const deleteUserAccount = async (token, userId) => {
    const response = await axios.delete(`${ADMIN_API}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};