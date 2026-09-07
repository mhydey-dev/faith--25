const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: [80, "Author must be 80 characters or fewer"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [1000, "Message must be 1000 characters or fewer"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
