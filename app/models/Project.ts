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
});

export default mongoose.models.Project || mongoose.model("Project", projectSchema);
