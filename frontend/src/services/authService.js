import axios from 'axios';
const API_URL = '/api/auth'

export const logIn = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data; // Expected to return { token }
};
 

export const getUserDetails = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data; // Return user details
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user details');
    }
};

export const changePassword = async (currentPassword, newPassword, token) => {
    try {
        const response = await axios.put(
            `${API_URL}/change-password`,
            { currentPassword, newPassword },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error changing password');
    }
};

export const resetUserPassword = async (email, newPassword, token) => {
    try {
        console.log(email, newPassword, token);
        const response = await axios.put(
            `${API_URL}/reset-user-password`,
            { email, newPassword },
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Add token as Authorization header
                },
            }
        );
        alert(response.data.message);
    } catch (error) {
        console.error('Error resetting password:', error);
        alert(error.response?.data?.message || 'Failed to reset password');
    }
};

export const resetAdminPassword = async (email, newPassword, token) => {
    try {
        const response = await axios.put(
            `${API_URL}/reset-admin-password`,
            { email, newPassword },
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Token for authentication
                },
            }
        );
        alert(response.data.message);
        return response.data; // Return the server response
    } catch (error) {
        // Log and rethrow the error for the caller to handle
        console.error('Error resetting admin password:', error);
        throw error.response?.data || { message: 'Failed to reset admin password' };
    }
};
