// Save token to localStorage
export const setToken = (token) => {
    localStorage.setItem('authToken', token);
};

// Get token from localStorage
export const getToken = () => {
    return localStorage.getItem('authToken');
};

// Remove token from localStorage
export const removeToken = () => {
    localStorage.removeItem('authToken');
};
