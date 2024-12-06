import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['librarian', 'user'], default: 'user' },
    requestedBooks: [{
        ebook: { type: mongoose.Schema.Types.ObjectId, ref: 'Ebook' },
        status: { type: String, enum: ['pending', 'granted', 'rejected'], default: 'pending' }
    }],
    issuedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ebook' }],
    feedback: [
        {
            ebook: { type: mongoose.Schema.Types.ObjectId, ref: 'Ebook' },
            rating: { type: Number, required: true },
            comment: { type: String, required: true }
        }
    ]
});

const User = mongoose.model("User", UserSchema);

export default User;