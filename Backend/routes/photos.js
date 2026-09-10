const express = require("express");
const multer = require("multer");
const Photo = require("../models/Photo");
const { requireAdmin } = require("../middleware/admin");
const { cloudinary, upload, friendlyUploadError } = require("../config/cloudinary");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.kind === "timeline" || req.query.kind === "portrait") {
      filter.kind = req.query.kind;
    }
    const photos = await Photo.find(filter).sort({ createdAt: -1 }).lean();
    res.json(photos);
  } catch (err) {
    next(err);
  }
});

router.post("/upload", requireAdmin, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 40MB or smaller."
          : err.message;
      res.status(400).json({ error: message });
      return;
    }

    if (err) {
      res.status(400).json({ error: friendlyUploadError(err) });
      return;
    }

    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "An image file is required (field name: image)." });
      return;
    }

    const caption =
      typeof req.body.caption === "string" ? req.body.caption.trim() : "";
    const kind = req.body.kind === "portrait" ? "portrait" : "timeline";

    if (kind === "portrait") {
      const previous = await Photo.find({ kind: "portrait" });
      for (const photo of previous) {
        try {
          await cloudinary.uploader.destroy(photo.cloudinaryId);
        } catch {
          /* ignore */
        }
        await photo.deleteOne();
      }
    }

    const photo = await Photo.create({
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename,
      caption,
      kind,
    });

    res.status(201).json(photo);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      res.status(404).json({ error: "Photo not found." });
      return;
    }

    try {
      await cloudinary.uploader.destroy(photo.cloudinaryId);
    } catch {
      /* ignore cloudinary miss */
    }

    await photo.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
