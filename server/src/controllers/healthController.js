import pool from "../config/db.js";

const DB_PROBE_TIMEOUT_MS = 3000;

// Sanitise pg error messages so they never leak hostnames, credentials,
// or connection strings to the HTTP response.
function sanitiseDbError(err) {
  const msg = err.message || "Database check failed";
  // pg errors can embed "host:port" or "password authentication failed for user"
  // Strip anything that looks like a credential or address.
  if (
    msg.includes("password") ||
    msg.includes("authentication") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ENOTFOUND")
  ) {
    return "Database unavailable";
  }
  if (msg.includes("timed out")) {
    return "Database probe timed out";
  }
  return "Database unavailable";
}

export async function healthCheck(req, res) {
  const base = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("timed out")),
        DB_PROBE_TIMEOUT_MS
      )
    );

    await Promise.race([pool.query("SELECT 1"), timeoutPromise]);

    // Application and database are both healthy
    return res.status(200).json({ ...base, database: "connected" });
  } catch (err) {
    // Application is running but database is unreachable — 503
    return res.status(503).json({
      ...base,
      status: "degraded",
      database: "disconnected",
      error: sanitiseDbError(err),
    });
  }
}
