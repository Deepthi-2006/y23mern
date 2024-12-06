import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";
import connectDB from "../config/db.js";

// Load environment variables
dotenv.config();

const createLibrarian = async () => {
    await connectDB();

    try {
        const librarianExists = await User.findOne({ role: "librarian" });
        if (librarianExists) {
            console.log("Librarian already exists");
            return;
        }

        const { DEFAULT_LIBRARIAN_USERNAME, DEFAULT_LIBRARIAN_PASSWORD, DEFAULT_LIBRARIAN_EMAIL } = process.env;

        const librarian = new User({
            username: DEFAULT_LIBRARIAN_USERNAME,
            password: DEFAULT_LIBRARIAN_PASSWORD,
            email: DEFAULT_LIBRARIAN_EMAIL,
            role: "librarian",
        });

        const salt = await bcrypt.genSalt(10);
        librarian.password = await bcrypt.hash(librarian.password, salt);

        await librarian.save();
        console.log("Librarian created");
    } catch (err) {
        console.error(err.message);
    } finally {
        mongoose.connection.close();
    }
};

createLibrarian();

