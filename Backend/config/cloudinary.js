const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "faith-forever",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    resource_type: "image",
    transformation: [{ width: 1600, crop: "limit" }],
  },
});

const musicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "faith-forever/music",
    resource_type: "video",
    allowed_formats: ["mp3", "m4a", "wav", "ogg", "aac"],
  },
});

const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/^image\/(jpe?g|png|webp|gif)$/i.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
  },
});

const musicUpload = multer({
  storage: musicStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/^audio\//i.test(file.mimetype) || /\.(mp3|m4a|wav|ogg|aac)$/i.test(file.originalname)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only MP3, M4A, WAV, OGG, or AAC audio is allowed"));
  },
});

module.exports = { cloudinary, upload, musicUpload, friendlyUploadError };

function friendlyUploadError(err) {
  const message = String(err && err.message ? err.message : "");
  if (err?.http_code === 403 || /403/.test(message) || /missing permissions/i.test(message)) {
    return "Cloudinary blocked the upload. In Cloudinary → API Keys, edit this key and allow Upload / Create.";
  }
  return message || "Image upload failed.";
}
