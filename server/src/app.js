import express from "express";
import cors from "cors";
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

// Centralised error handler — must be registered last
app.use(errorHandler);

export default app;
