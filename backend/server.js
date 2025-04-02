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
import importRoutes from "./routes/importRoutes.js";
import emailRoutes from "./routes/emailRoutes.js"
import removalRoutes from "./routes/removalRoutes.js"

dotenv.config()

const PORT = process.env.PORT
const app = express()

app.use(express.json({ limit: '50mb' })); // Increase the limit for JSON payloads
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase the limit for URL-encoded payloads


app.use(logger)
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:7000'],
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

