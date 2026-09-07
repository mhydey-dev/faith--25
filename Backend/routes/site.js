const express = require("express");
const multer = require("multer");
const Site = require("../models/Site");
const { requireAdmin, hashLetterPassword } = require("../middleware/admin");
const { cloudinary, upload, friendlyUploadError } = require("../config/cloudinary");

const router = express.Router();

function parseMusicUrl(raw) {
  const url = typeof raw === "string" ? raw.trim() : "";
  if (!url) return "";
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }
  return url;
}

async function clearHostedMusic(site) {
  if (!site.musicCloudinaryId) return;
  try {
    await cloudinary.uploader.destroy(site.musicCloudinaryId, {
      resource_type: "video",
    });
  } catch {
    /* previous file may already be gone */
  }
  site.musicCloudinaryId = "";
}

function letterImagesPayload(site) {
  return (site.loveLetterImages || []).map((image) => ({
    _id: String(image._id),
    imageUrl: image.imageUrl,
    caption: image.caption || "",
  }));
}

function publicSitePayload(site) {
  return {
    quiz: site.quiz || [],
    hasLoveLetter: Boolean(
      site.loveLetterBody && String(site.loveLetterBody).trim() && site.loveLetterPasswordHash,
    ),
    loveLetterTitle: site.loveLetterTitle || "Only for you",
    updatedAt: site.updatedAt,
  };
}

function adminSitePayload(site) {
  return {
    ...publicSitePayload(site),
    loveLetterBody: site.loveLetterBody || "",
    hasLetterPassword: Boolean(site.loveLetterPasswordHash),
    musicUrl: site.musicUrl || "",
    musicTitle: site.musicTitle || "",
    loveLetterImages: letterImagesPayload(site),
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const site = await Site.getMain(true);
    res.json(publicSitePayload(site));
  } catch (err) {
    next(err);
  }
});

router.get("/admin", requireAdmin, async (_req, res, next) => {
  try {
    const site = await Site.getMain(true);
    res.json(adminSitePayload(site));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/login", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

router.put("/admin", requireAdmin, async (req, res, next) => {
  try {
    const site = await Site.getMain(true);
    const body = req.body || {};

    if (Array.isArray(body.quiz)) {
      site.quiz = body.quiz.map((q, index) => ({
        id: typeof q.id === "string" && q.id.trim() ? q.id.trim() : `q${index + 1}`,
        prompt: String(q.prompt || "").trim(),
        options: Array.isArray(q.options)
          ? q.options.map((o) => ({
              label: String(o.label || "").trim(),
              correct: Boolean(o.correct),
            }))
          : [],
      }));
    }

    if (typeof body.loveLetterTitle === "string") {
      site.loveLetterTitle = body.loveLetterTitle.trim();
    }

    if (typeof body.loveLetterBody === "string") {
      site.loveLetterBody = body.loveLetterBody.trim();
    }

    if (typeof body.musicTitle === "string") {
      site.musicTitle = body.musicTitle.trim();
    }

    if (typeof body.musicUrl === "string") {
      const musicUrl = parseMusicUrl(body.musicUrl);
      if (musicUrl === null) {
        res.status(400).json({ error: "Enter a valid http(s) music link." });
        return;
      }
      if (musicUrl !== site.musicUrl) {
        await clearHostedMusic(site);
      }
      site.musicUrl = musicUrl;
    }

    if (typeof body.letterPassword === "string" && body.letterPassword.trim()) {
      site.loveLetterPasswordHash = hashLetterPassword(body.letterPassword.trim());
    }

    await site.save();
    res.json(adminSitePayload(site));
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/music", requireAdmin, async (_req, res, next) => {
  try {
    const site = await Site.getMain(true);
    await clearHostedMusic(site);
    site.musicUrl = "";
    site.musicTitle = "";
    await site.save();
    res.json(adminSitePayload(site));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/letter-images", requireAdmin, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5MB or smaller."
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

    const site = await Site.getMain(true);
    if (!Array.isArray(site.loveLetterImages)) site.loveLetterImages = [];
    const caption = typeof req.body.caption === "string" ? req.body.caption.trim() : "";
    const next = {
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename,
      caption,
    };

    const at = Number.parseInt(String(req.body.at ?? ""), 10);
    if (Number.isInteger(at) && at >= 0 && at < site.loveLetterImages.length) {
      const previous = site.loveLetterImages[at];
      if (previous?.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(previous.cloudinaryId);
        } catch {
          /* ignore */
        }
      }
      site.loveLetterImages.splice(at, 1, next);
    } else {
      if (site.loveLetterImages.length >= 20) {
        res.status(400).json({ error: "You can add up to 20 photos in the letter." });
        return;
      }
      site.loveLetterImages.push(next);
    }
    await site.save();
    res.status(201).json(adminSitePayload(site));
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/letter-images/:id", requireAdmin, async (req, res, next) => {
  try {
    const site = await Site.getMain(true);
    if (!Array.isArray(site.loveLetterImages)) site.loveLetterImages = [];
    const image = site.loveLetterImages.id(req.params.id);
    if (!image) {
      res.status(404).json({ error: "Letter photo not found." });
      return;
    }
    try {
      await cloudinary.uploader.destroy(image.cloudinaryId);
    } catch {
      /* ignore */
    }
    image.deleteOne();
    await site.save();
    res.json(adminSitePayload(site));
  } catch (err) {
    next(err);
  }
});

router.post("/letter/unlock", async (req, res, next) => {
  try {
    const password =
      typeof req.body.password === "string" ? req.body.password.trim() : "";
    if (!password) {
      res.status(400).json({ error: "Password is required." });
      return;
    }

    const site = await Site.getMain(true);
    if (!site.loveLetterBody || !site.loveLetterPasswordHash) {
      res.status(404).json({ error: "No locked letter has been set yet." });
      return;
    }

    const attempt = hashLetterPassword(password);
    const expected = Buffer.from(site.loveLetterPasswordHash);
    const got = Buffer.from(attempt);

    if (expected.length !== got.length || !cryptoTimingSafeEqual(expected, got)) {
      res.status(401).json({ error: "Wrong password." });
      return;
    }

    res.json({
      title: site.loveLetterTitle,
      body: site.loveLetterBody,
      musicUrl: site.musicUrl || "",
      musicTitle: site.musicTitle || "",
      images: letterImagesPayload(site),
    });
  } catch (err) {
    next(err);
  }
});

function cryptoTimingSafeEqual(a, b) {
  const crypto = require("crypto");
  return crypto.timingSafeEqual(a, b);
}

module.exports = router;
