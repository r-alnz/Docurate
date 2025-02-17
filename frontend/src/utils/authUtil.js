// Save token to localStorage
export const setToken = (token) => {
    // console.log("Saving token:", token);
    localStorage.setItem('authToken', token);
};

// Get token from localStorage
export const getToken = () => {
    const token = localStorage.getItem('authToken');
    // console.log("Fetching token:", token);
    return token;
};

// Remove token from localStorage
export const removeToken = () => {
    localStorage.removeItem('authToken');
};
