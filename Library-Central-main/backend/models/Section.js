import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  dateCreated: { type: Date, default: Date.now },
});

const Section = mongoose.model("Section", SectionSchema);

export default Section;
