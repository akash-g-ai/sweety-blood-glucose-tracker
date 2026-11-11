import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import glucoseRouter from "./routes/glucose.js";
import reportsRouter from "./routes/reports.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Allow all origins in development; restrict to CORS_ORIGIN in other environments
const corsOptions =
  process.env.NODE_ENV === "development"
    ? {}
    : { origin: process.env.CORS_ORIGIN };

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/readings", glucoseRouter);
app.use("/api/reports", reportsRouter);

// Unknown API routes return JSON 404 ? must not fall through to SPA fallback
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Serve React production build when it exists (production mode)
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDistPath = resolve(__dirname, "../../client/dist");

if (existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback: serve index.html for all non-API routes
  app.use((req, res) => {
    res.sendFile(resolve(clientDistPath, "index.html"));
  });
}

// Centralised error handler ? must be registered last
app.use(errorHandler);

export default app;