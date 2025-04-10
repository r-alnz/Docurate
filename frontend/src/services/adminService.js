import axios from 'axios';
import { getApiUrl } from "../api.js";

const API_URL = getApiUrl("/admin");

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
// export const addUserAccount = async (token, userDetails) => {
//     console.log(userDetails);
//     const response = await axios.post(`${API_URL}/users`, userDetails, {
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     });
//     return response.data;
// };

export const addUserAccount = async (token, userDetails) => {
    console.log('📤 Sending user data:', JSON.stringify(userDetails, null, 2));
    
    Object.entries(userDetails).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            console.warn(`🚨 Missing value for: ${key}`);
        }
    });

    const response = await axios.post(`${API_URL}/users`, userDetails, {
        headers: { Authorization: `Bearer ${token}` },
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

// Inactivate a user account
export const inactivateUserAccount = async (token, userId) => {
    const response = await axios.patch(`${API_URL}/inactivate/${userId}`, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Inactivate a user account
export const activateUserAccount = async (token, userId) => {
    const response = await axios.patch(`${API_URL}/activate/${userId}`, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};