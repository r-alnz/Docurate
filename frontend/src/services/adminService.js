import axios from 'axios';
const API_URL = '/api/admin'; // Adjust based on your API structure

// Fetch user accounts
export const fetchUserAccounts = async (token) => {
    const response = await axios.get(`${API_URL}/users`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Add a user account
export const addUserAccount = async (token, userDetails) => {
    console.log(userDetails);
    const response = await axios.post(`${API_URL}/users`, userDetails, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Edit a user account
export const editUserAccount = async (token, userId, userDetails) => {
    const response = await axios.patch(`${API_URL}/users/${userId}`, userDetails, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Delete a user account
export const deleteUserAccount = async (token, userId) => {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};