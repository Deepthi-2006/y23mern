import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config(); // Automatically loads `.env` from the root directory

const app = express();

// Connect Database
connectDB();

// Enable CORS for all requests
app.use(cors());

// Init Middleware
app.use(express.json());

// Define Routes
import authRoutes from './routes/auth.js';
import librarianRoutes from './routes/librarian.js';
import userRoutes from './routes/user.js';

app.use('/api/auth', authRoutes);
app.use('/api/librarian', librarianRoutes);
app.use('/api/user', userRoutes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
