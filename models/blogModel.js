import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photo: {
      data: Buffer,  //image file type  ,, data type buffer
      contentType: String,
    }
  },
  { timestamps: true }  //order create
);

export default mongoose.model("blogs", blogSchema);