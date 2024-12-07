import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; // Ensure this path is correct
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: './process.env' });
process.env.MONGO_URI = 'mongodb+srv://2300030201cseh:8aNhIc3KXGyMRfsV@cluster0.9of15.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
process.env.DEFAULT_LIBRARIAN_USERNAME = 'library';
process.env.DEFAULT_LIBRARIAN_PASSWORD = 'lib@123';
process.env.DEFAULT_LIBRARIAN_EMAIL = 'lib@gmail.com';

const createLibrarian = async () => {
    await connectDB();

    try {
        const librarianExists = await User.findOne({ role: 'librarian' });
        if (librarianExists) {
            console.log('Librarian already exists');
            return;
        }

        const { DEFAULT_LIBRARIAN_USERNAME, DEFAULT_LIBRARIAN_PASSWORD, DEFAULT_LIBRARIAN_EMAIL } = process.env;

        const librarian = new User({
            username: DEFAULT_LIBRARIAN_USERNAME,
            password: DEFAULT_LIBRARIAN_PASSWORD,
            email: DEFAULT_LIBRARIAN_EMAIL,
            role: 'librarian'
        });

        const salt = await bcrypt.genSalt(10);
        librarian.password = await bcrypt.hash(librarian.password, salt);

        await librarian.save();
        console.log('Librarian created');
    } catch (err) {
        console.error(err.message);
    } finally {
        mongoose.connection.close();
    }
};

createLibrarian();