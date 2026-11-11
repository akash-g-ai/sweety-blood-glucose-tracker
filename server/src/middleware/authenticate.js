import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token required." });
  }

  const token = authHeader.slice(7); // remove "Bearer " prefix

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Validate the payload shape before trusting it.
    // A token signed with the correct secret but carrying unexpected claims
    // (e.g. a crafted token with id: 0 or a string id) must be rejected.
    if (
      typeof payload !== "object" ||
      payload === null ||
      !Number.isInteger(payload.id) ||
      payload.id < 1 ||
      typeof payload.email !== "string" ||
      payload.email.trim() === ""
    ) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
