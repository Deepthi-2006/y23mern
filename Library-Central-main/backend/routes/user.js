import express from "express";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";
import auth from "../middleware/auth.js";
import Ebook from "../models/Ebook.js";
import Section from "../models/Section.js";
import User from "../models/User.js";

const router = express.Router();

// User Dashboard
router.get("/dashboard", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId)
      .populate("issuedBooks")
      .populate("feedback.ebook");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const dashboardData = {
      requestedBooks: user.requestedBooks,
      issuedBooks: user.issuedBooks,
      feedback: user.feedback,
    };

    res.json(dashboardData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// View issued e-books for a user
router.get("/issued-books", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).populate({
      path: "issuedBooks",
      populate: {
        path: "section",
        select: "name",
      },
    });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const issuedBooks = user.issuedBooks.map((book) => ({
      _id: book._id,
      name: book.name,
      content: book.content,
      authors: book.authors,
      section: book.section ? book.section.name : "N/A",
      dateIssued: book.dateIssued,
      returnDate: book.returnDate,
      issuedTo: book.issuedTo,
    }));

    res.json(issuedBooks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Other routes remain unchanged
// ...

export default router;