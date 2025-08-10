import dbConnect from "./mongodb";
import mongoose, { Schema } from "mongoose";

dbConnect();

const projectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  contributors: {
    type: [String],
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  fundingGoal: {
    type: Number,
    required: true,
  },
  deadline: {
    type: Number, // Unix timestamp (seconds)
    required: true,
  },
  creatorName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: "General",
  },
  websiteUrl: {
    type: String,
    default: "",
  },
});

export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);
