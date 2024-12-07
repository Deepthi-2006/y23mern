import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const dbURI = process.env.MONGO_URI;
        if (!dbURI) {
            console.error("MongoDB URI is not set in the environment variables.");
            process.exit(1); // Exit the process if URI is missing
        }

        // Connect to MongoDB
        await mongoose.connect(dbURI);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1); // Exit the process with failure
    }
};

export default connectDB;