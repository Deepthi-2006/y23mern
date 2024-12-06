import mongoose from "mongoose";

const EbookSchema = new mongoose.Schema({
    name: { type: String, required: true },
    content: { type: String, required: true },
    authors: { type: [String], required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    dateIssued: { type: Date },
    returnDate: { type: Date },
    issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Ebook = mongoose.model("Ebook", EbookSchema);

export default Ebook;