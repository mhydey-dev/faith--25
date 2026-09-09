const mongoose = require("mongoose");

const quizOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 200 },
    correct: { type: Boolean, default: false },
  },
  { _id: false },
);

const quizQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    prompt: { type: String, required: true, trim: true, maxlength: 400 },
    options: {
      type: [quizOptionSchema],
      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length >= 2 &&
            value.some((o) => o.correct)
          );
        },
        message:
          "Each question needs at least 2 options and one correct answer.",
      },
    },
  },
  { _id: false },
);

const DEFAULT_QUIZ = [
  {
    id: "q1",
    prompt: "What lights Faith up the most?",
    options: [
      { label: "Being around people she loves", correct: true },
      { label: "Sitting in silence forever", correct: false },
      { label: "Skipping every celebration", correct: false },
    ],
  },
  {
    id: "q2",
    prompt: "How would friends describe her in one word?",
    options: [
      { label: "Cold", correct: false },
      { label: "Radiant", correct: true },
      { label: "Forgettable", correct: false },
    ],
  },
];

const letterImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    cloudinaryId: { type: String, default: "", trim: true },
    caption: { type: String, default: "", trim: true, maxlength: 200 },
    kind: { type: String, enum: ["image", "video"], default: "image" },
  },
  { timestamps: true },
);

const siteSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "main" },
    quiz: { type: [quizQuestionSchema], default: DEFAULT_QUIZ },
    musicUrl: { type: String, default: "", trim: true, maxlength: 2000 },
    musicCloudinaryId: { type: String, default: "", trim: true },
    musicTitle: { type: String, default: "", trim: true, maxlength: 120 },
    loveLetterTitle: {
      type: String,
      default: "Only for you ifemi ❤️💕",
      trim: true,
      maxlength: 120,
    },
    loveLetterBody: {
      type: String,
      default: "",
      maxlength: 12000,
    },
    loveLetterPasswordHash: {
      type: String,
      default: "",
      select: false,
    },
    loveLetterImages: { type: [letterImageSchema], default: [] },
  },
  { timestamps: true },
);

siteSchema.statics.getMain = async function getMain(includeSecret = false) {
  let query = this.findOne({ key: "main" });
  if (includeSecret) query = query.select("+loveLetterPasswordHash");
  let site = await query;
  if (!site) {
    site = await this.create({ key: "main", quiz: DEFAULT_QUIZ });
    if (includeSecret) {
      site = await this.findOne({ key: "main" }).select(
        "+loveLetterPasswordHash",
      );
    }
  }
  return site;
};

module.exports = mongoose.model("Site", siteSchema);
