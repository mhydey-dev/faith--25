const dns = require("dns");
const mongoose = require("mongoose");

const PUBLIC_DNS = ["8.8.8.8", "1.1.1.1", "8.8.4.4"];
const publicResolver = new dns.Resolver();
publicResolver.setServers(PUBLIC_DNS);

function preferPublicDns() {
  // Mobile hotspots and some ISP resolvers fail Atlas SRV lookups
  // (querySrv ESERVFAIL) even though the cluster is up.
  try {
    dns.setServers(PUBLIC_DNS);
    if (typeof dns.setDefaultResultOrder === "function") {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch {
    // Ignore if the runtime does not allow changing DNS servers.
  }
}

function publicLookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  const family = options.family || 0;
  const all = Boolean(options.all);

  const resolve = (ipFamily) =>
    new Promise((resolvePromise, reject) => {
      const method = ipFamily === 6 ? "resolve6" : "resolve4";
      publicResolver[method](hostname, (err, addresses) => {
        if (err) {
          reject(err);
          return;
        }
        resolvePromise(addresses.map((address) => ({ address, family: ipFamily })));
      });
    });

  const run = async () => {
    if (family === 6) return resolve(6);
    if (family === 4) return resolve(4);
    try {
      return await resolve(4);
    } catch {
      return resolve(6);
    }
  };

  run()
    .then((results) => {
      if (!results.length) {
        const err = new Error(`queryA ENODATA ${hostname}`);
        err.code = "ENODATA";
        throw err;
      }
      if (all) callback(null, results);
      else callback(null, results[0].address, results[0].family);
    })
    .catch((err) => callback(err));
}

function isDnsError(err) {
  const code = err?.code || "";
  const message = err?.message || "";
  return (
    code === "ESERVFAIL" ||
    code === "EAI_AGAIN" ||
    /querySrv/i.test(message) ||
    /getaddrinfo/i.test(message)
  );
}

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not set. Add it to your .env file.");
  }

  preferPublicDns();
  mongoose.set("strictQuery", true);

  const options = {
    serverSelectionTimeoutMS: 20000,
    family: 4,
    lookup: publicLookup,
  };

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await mongoose.connect(uri, options);
      console.log("MongoDB connected");
      return;
    } catch (err) {
      lastError = err;
      if (!isDnsError(err) || attempt === 3) break;
      console.warn(`MongoDB DNS lookup failed (attempt ${attempt}/3), retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  if (isDnsError(lastError)) {
    throw new Error(
      "MongoDB DNS lookup failed. Your network DNS cannot resolve the Atlas cluster. Try another network, or switch Windows DNS to 8.8.8.8."
    );
  }

  throw lastError;
}

module.exports = connectDB;
