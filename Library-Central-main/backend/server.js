import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';


const app = express();
dotenv.config({path:'./process.env'}); 
console.log(process.env.JWT_SECRET)

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
import sectionRoutes from './routes/SectionRoutes.js'

app.use('/api/auth', authRoutes);
app.use('/api/librarian', librarianRoutes);
app.use('/api/user', userRoutes);
app.use('/api/section',sectionRoutes);
const PORT = 5000;
const ebookRoutes = require("./routes/ebookRoutes");
app.use("/api/ebooks", ebookRoutes);


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
