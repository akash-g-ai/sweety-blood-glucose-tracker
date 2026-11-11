import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../services/userService.js";

const SALT_ROUNDS = 12;

// Valid 60-char bcrypt hash (cost 12). Used in login when the email is not found
// so that bcrypt.compare always runs, preventing timing-based user enumeration.
const DUMMY_HASH = "$2b$12$p5EmM0.8GN4Rsgxyu1YQbukN2TUK7duWSdj5eKWvW3dPekXNoN9Ze";

// Rejects whitespace, multiple @ symbols, missing local part,
// missing domain, and missing domain extension.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" }
  );
}

export async function register(req, res, next) {
  try {
    // Guard against missing, null, or non-object bodies (including arrays).
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Request body must be a JSON object." });
    }

    const rawName = req.body.name;
    const rawEmail = req.body.email;
    const password = req.body.password;

    // Type-check all inputs before calling any string methods
    if (!rawName || typeof rawName !== "string" || rawName.trim() === "") {
      return res.status(400).json({ error: "Name is required." });
    }
    if (!rawEmail || typeof rawEmail !== "string") {
      return res.status(400).json({ error: "Email is required." });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required." });
    }

    // Normalize email only — never modify password
    const email = rawEmail.trim().toLowerCase();
    const name = rawName.trim();

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Email is invalid." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser(name, email, passwordHash);
    const token = signToken(user);

    return res.status(201).json({ token, user });
  } catch (err) {
    // Concurrent registration can bypass the findUserByEmail check and hit
    // the database unique constraint — handle it here rather than returning 500.
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email is already registered." });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    // Guard against missing, null, or non-object bodies (including arrays).
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Request body must be a JSON object." });
    }

    const rawEmail = req.body.email;
    const password = req.body.password;

    // Type-check before string methods
    if (!rawEmail || typeof rawEmail !== "string" || !password || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Normalize email only — never modify password
    const email = rawEmail.trim().toLowerCase();

    const user = await findUserByEmail(email);

    // Always run bcrypt.compare to prevent timing-based user enumeration.
    // DUMMY_HASH is a valid cost-12 hash so compare never throws.
    const passwordHash = user ? user.password_hash : DUMMY_HASH;
    const match = await bcrypt.compare(password, passwordHash);

    if (!user || !match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}
