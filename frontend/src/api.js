const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Helper function to construct full API URLs dynamically
 * @param {string} endpoint - API endpoint (e.g., "/auth", "/removals")
 * @returns {string} - Full API URL
 */
export const getApiUrl = (endpoint) => `${BASE_API_URL}/api${endpoint}`;
