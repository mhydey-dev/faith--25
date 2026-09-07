const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    cloudinaryId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      default: "",
      maxlength: [280, "Caption must be 280 characters or fewer"],
    },
    kind: {
      type: String,
      enum: ["timeline", "portrait"],
      default: "timeline",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Photo", photoSchema);
