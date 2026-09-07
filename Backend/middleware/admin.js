const crypto = require("crypto");

function requireAdmin(req, res, next) {
  const configured = process.env.ADMIN_KEY;
  if (!configured) {
    res.status(503).json({
      error: "Admin is not configured. Set ADMIN_KEY in the Backend .env file.",
    });
    return;
  }

  const provided = req.get("x-admin-key") || "";
  const a = Buffer.from(provided);
  const b = Buffer.from(configured);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    res.status(401).json({ error: "Invalid admin key." });
    return;
  }

  next();
}

function hashLetterPassword(password) {
  const pepper = process.env.LETTER_PEPPER || process.env.ADMIN_KEY || "faith-25";
  return crypto.createHash("sha256").update(`${pepper}:${password}`).digest("hex");
}

module.exports = { requireAdmin, hashLetterPassword };
