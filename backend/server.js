// Importing required packages and modules

import express from 'express' // Importing Express framework to create server and handle routing
import dotenv from 'dotenv' // Importing dotenv to load environment variables from .env file
import cors from 'cors' // Importing CORS to handle Cross-Origin Resource Sharing for frontend-backend communication
import logger from './middleware/logger.js' // Importing custom middleware for logging (currently unused here)
import connectDB from './config/database.js' // Importing function to connect to MongoDB database

// import { createSuperAdminUser } from './models/userModel.js' 
// Importing function to create Super Admin User (commented out, for optional use)

import superAdminRoutes from './routes/superAdminRoutes.js' // Importing Super Admin related API routes
import adminRoutes from './routes/adminRoutes.js' // Importing Admin related API routes
import authRoutes from './routes/authRoutes.js' // Importing Authentication (Login/Register) routes
import templateRoutes from './routes/templateRoutes.js' // Importing Template related routes
import documentRoutes from './routes/documentRoutes.js' // Importing Document management related routes
import documentRevisionRoutes from './routes/documentRevisionRoutes.js' // Importing Document Revision routes
import importRoutes from "./routes/importRoutes.js" // Importing routes for importing data/documents
import emailRoutes from "./routes/emailRoutes.js" // Importing routes to handle email-related functionalities
import removalRoutes from "./routes/removalRoutes.js" // Importing routes for handling removal/deletion operations

dotenv.config() // Loads environment variables from .env file into process.env

// Allowed origins for CORS — defines frontend URLs that can access this backend
const allowedOrigins = [
    "http://localhost:5173",  // Local development (Vite)
    "http://localhost:3000",  // Local development (React default)
    "http://localhost:8000",  
    "http://localhost:7000",
    "http://localhost:5000",
    "https://docurate-eight.vercel.app" // Production frontend hosted on Vercel
];

const PORT = process.env.PORT || 7000; // Define port number (from .env or default to 7000)
const app = express() // Create an Express application instance

// Middleware to parse incoming JSON payloads with increased size limit
app.use(express.json({ limit: '50mb' }));

// Middleware to parse incoming URL-encoded data with increased size limit
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root Route — Just for testing if the server is running
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// CORS Middleware Configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests if no origin (like Postman) or if origin is in allowed list
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error("Not allowed by CORS")); // Otherwise, block request
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers in request
    credentials: true, // Allow cookies and authorization headers in requests
}));

// Registering API Routes
app.use('/api/auth', authRoutes); // Authentication APIs (Login/Register)
app.use('/api/superadmin', superAdminRoutes); // Super Admin related APIs
app.use('/api/admin', adminRoutes); // Admin related APIs
app.use('/api/templates', templateRoutes); // Template management APIs
app.use('/api/documents', documentRoutes); // Document management APIs
app.use('/api', documentRevisionRoutes); // Document revision APIs
app.use("/api/import", importRoutes); // Import functionalities
app.use("/api/email", emailRoutes); // Email functionalities (sending emails)
app.use('/api/removals', removalRoutes); // Remove/Delete operations APIs

// Connect to Database and Start Server
connectDB() // Connecting to MongoDB database
    .then(async () => {
        // await createSuperAdminUser() // Optionally create a Super Admin user on startup
        app.listen(PORT, () => { // Start server on specified port
            console.log("Server running on port", PORT)
        })
    })
    .catch((error) => { // If DB connection fails, log error and exit
        console.log("Error: ", error.message);
        process.exit(1) // Exit process with failure code
    })
