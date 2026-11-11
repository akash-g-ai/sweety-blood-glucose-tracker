import {
  createReading,
  getReadingsByUser,
  getReadingById,
  findDuplicateReading,
  updateReading,
  deleteReading,
} from "../services/glucoseService.js";

const ALLOWED_SLOTS = ["morning_fasting", "after_breakfast", "after_lunch", "after_dinner"];
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// The application's calendar date policy is Asia/Kolkata.
// Future-date checks compare against today in this timezone, not UTC.
const KOLKATA_TZ = "Asia/Kolkata";

// Validates YYYY-MM-DD format and confirms it is a real calendar date.
function isValidDate(str) {
  const match = str.match(DATE_RE);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  const d = new Date(Date.UTC(year, month - 1, day));

  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

function isFutureDate(str) {
  const now = new Date();
  const todayInKolkata = now.toLocaleDateString("en-CA", { timeZone: KOLKATA_TZ });
  return str > todayInKolkata;
}

// Validates :id as a positive safe integer.
function parseId(param) {
  const num = Number(param);
  if (!Number.isSafeInteger(num) || num < 1) {
    return { valid: false };
  }
  return { valid: true, id: num };
}

function validateReadingFields(body) {
  const { reading_date, slot, value_mgdl, notes } = body;

  if (!reading_date || typeof reading_date !== "string") {
    return { error: "reading_date is required." };
  }
  if (!isValidDate(reading_date)) {
    return { error: "reading_date must be a valid date in YYYY-MM-DD format." };
  }
  if (isFutureDate(reading_date)) {
    return { error: "reading_date cannot be in the future." };
  }
  if (!slot || typeof slot !== "string") {
    return { error: "slot is required." };
  }
  if (!ALLOWED_SLOTS.includes(slot)) {
    return { error: `slot must be one of: ${ALLOWED_SLOTS.join(", ")}.` };
  }
  if (!Number.isInteger(value_mgdl)) {
    return { error: "value_mgdl must be an integer." };
  }
  if (value_mgdl < 40 || value_mgdl > 600) {
    return { error: "value_mgdl must be between 40 and 600." };
  }
  if (notes !== undefined && notes !== null && typeof notes !== "string") {
    return { error: "notes must be a string or null." };
  }
  return null;
}

export async function create(req, res, next) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Request body must be a JSON object." });
    }

    const error = validateReadingFields(req.body);
    if (error) return res.status(400).json(error);

    const { reading_date, slot, value_mgdl, notes } = req.body;
    const userId = req.user.id;

    const duplicate = await findDuplicateReading(userId, reading_date, slot);
    if (duplicate) {
      return res.status(409).json({ error: "A reading already exists for this date and slot." });
    }

    const reading = await createReading(userId, reading_date, slot, value_mgdl, notes ?? null);
    return res.status(201).json(reading);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A reading already exists for this date and slot." });
    }
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const readings = await getReadingsByUser(req.user.id);
    return res.status(200).json(readings);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const { id, valid } = parseId(req.params.id);
    if (!valid) {
      return res.status(400).json({ error: "id must be a positive integer." });
    }

    const reading = await getReadingById(id, req.user.id);
    if (!reading) {
      return res.status(404).json({ error: "Reading not found." });
    }
    return res.status(200).json(reading);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id, valid } = parseId(req.params.id);
    if (!valid) {
      return res.status(400).json({ error: "id must be a positive integer." });
    }
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Request body must be a JSON object." });
    }

    const error = validateReadingFields(req.body);
    if (error) return res.status(400).json(error);

    const { reading_date, slot, value_mgdl, notes } = req.body;
    const userId = req.user.id;

    const existing = await getReadingById(id, userId);
    if (!existing) {
      return res.status(404).json({ error: "Reading not found." });
    }

    // If notes is omitted from the request, preserve the existing value
    const notesValue = notes === undefined ? existing.notes : (notes ?? null);

    // Only check for duplicates if date or slot changed
    if (reading_date !== existing.reading_date || slot !== existing.slot) {
      const duplicate = await findDuplicateReading(userId, reading_date, slot, id);
      if (duplicate) {
        return res.status(409).json({ error: "A reading already exists for this date and slot." });
      }
    }

    const updated = await updateReading(id, userId, reading_date, slot, value_mgdl, notesValue);
    if (!updated) {
      return res.status(404).json({ error: "Reading not found." });
    }
    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A reading already exists for this date and slot." });
    }
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id, valid } = parseId(req.params.id);
    if (!valid) {
      return res.status(400).json({ error: "id must be a positive integer." });
    }

    const deleted = await deleteReading(id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: "Reading not found." });
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
