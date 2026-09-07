const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const author = typeof req.body.author === "string" ? req.body.author.trim() : "";
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

    if (!author || !content) {
      res.status(400).json({ error: "Author and content are required." });
      return;
    }

    const message = await Message.create({ author, content });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
