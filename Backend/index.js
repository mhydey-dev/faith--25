require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const messageRoutes = require("./routes/messages");
const photoRoutes = require("./routes/photos");
const siteRoutes = require("./routes/site");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const LOCAL_ORIGINS = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function parseOriginList(value) {
  return String(value || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function allowedOrigins() {
  const fromEnv = [
    ...parseOriginList(process.env.CLIENT_ORIGIN),
    ...parseOriginList(process.env.CLIENT_ORIGINS),
  ];

  return new Set([...LOCAL_ORIGINS, ...fromEnv]);
}

function isPrivateLanHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1" ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

function originAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins().has(origin)) return true;
  try {
    const url = new URL(origin);
    if (url.protocol === "https:" && url.hostname.endsWith(".onrender.com")) return true;
    return url.protocol === "http:" && isPrivateLanHost(url.hostname);
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    callback(null, originAllowed(origin));
  },
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-admin-key"],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};

app.use(cors(corsOptions));
// Express 5 no longer treats "*" as a catch-all, so preflight must be named.
app.options("/{*path}", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/messages", messageRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/site", siteRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
    res.status(400).json({ error: message });
    return;
  }

  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong.",
  });
});

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
