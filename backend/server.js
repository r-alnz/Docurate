import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import logger from './middleware/logger.js'
import connectDB from './config/database.js'
// import { createSuperAdminUser } from './models/userModel.js'
import superAdminRoutes from './routes/superAdminRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import documentRevisionRoutes from './routes/documentRevisionRoutes.js'; // Add this line
import importRoutes from "./routes/importRoutes.js";
import emailRoutes from "./routes/emailRoutes.js"
import removalRoutes from "./routes/removalRoutes.js"

dotenv.config()

const allowedOrigins = [
    "http://localhost:5173",  // Local dev
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:7000",
    "http://localhost:5000",
    "https://docurate-eight.vercel.app"
  ];

const PORT = process.env.PORT || 7000;
const app = express()

app.use(express.json({ limit: '50mb' })); // Increase the limit for JSON payloads
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase the limit for URL-encoded payloads

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.use(cors({
    // origin: '*',
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // ✅ Allow credentials (tokens/cookies)
}));

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', documentRevisionRoutes); // Add this line
app.use("/api/import", importRoutes);
app.use("/api/email", emailRoutes);
app.use('/api/removals', removalRoutes);



connectDB()
    .then(async () => {
        // await createSuperAdminUser()
        app.listen(PORT, () => {
            console.log("Server running on port", PORT)
        })
    })
    .catch((error) => {
        console.log("Error: ", error.message);
        process.exit(1)
    })

