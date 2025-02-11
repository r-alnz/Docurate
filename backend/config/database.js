import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB successfully connected: ", conn.connection.host)
    } catch (error) {
        console("MongoDB connection error: ", error)
        process.exit(1)
    }
}

export default connectDB