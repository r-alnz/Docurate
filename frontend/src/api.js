const allowedOrigins = [
  "http://localhost:5173",  // Local dev
  "http://localhost:3000",
  "http://localhost:8000",
  "http://localhost:7000",
  "http://localhost:5000",
  "https://docurate-eight.vercel.app"
];

// Dynamically determine the base URL based on allowed origins
const getBaseApiUrl = () => {
  const { hostname, port } = window.location;
  
  // Log the hostname and port for debugging
  console.log("Current hostname:", hostname, "Port:", port);

  // Check if the current origin matches any in the allowedOrigins list
  const currentOrigin = `${window.location.protocol}//${hostname}:${port}`;
  const isAllowed = allowedOrigins.some(origin => currentOrigin.includes(origin));

  if (isAllowed) {
      // If the origin is localhost, decide the appropriate API URL based on the port
      if (hostname.includes("localhost")) {
          return `http://localhost:${port}`; // Dynamically use the current port
      }
      return "https://docurate.onrender.com"; // Use Render backend if deployed
  } else {
      console.error("Origin not allowed:", currentOrigin);
      throw new Error("Origin not allowed"); // Block access if the origin is not allowed
  }
};

// Dynamically determine the base URL
const BASE_API_URL = getBaseApiUrl();

/**
 * Helper function to construct full API URLs dynamically
 * @param {string} endpoint - API endpoint (e.g., "/auth", "/removals")
 * @returns {string} - Full API URL
 */
export const getApiUrl = (endpoint) => `${BASE_API_URL}/api${endpoint}`;
