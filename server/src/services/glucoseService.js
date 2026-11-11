import pool from "../config/db.js";

export async function createReading(userId, readingDate, slot, valueMgdl, notes) {
  const result = await pool.query(
    `INSERT INTO glucose_readings (user_id, reading_date, slot, value_mgdl, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, reading_date::text AS reading_date, slot, value_mgdl, notes, created_at`,
    [userId, readingDate, slot, valueMgdl, notes]
  );
  return result.rows[0];
}

export async function getReadingsByUser(userId) {
  const result = await pool.query(
    `SELECT id, reading_date::text AS reading_date, slot, value_mgdl, notes, created_at
     FROM glucose_readings
     WHERE user_id = $1
     ORDER BY reading_date DESC, created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getReadingById(id, userId) {
  const result = await pool.query(
    `SELECT id, reading_date::text AS reading_date, slot, value_mgdl, notes, created_at
     FROM glucose_readings
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] ?? null;
}

export async function findDuplicateReading(userId, readingDate, slot, excludeId = null) {
  const params = [userId, readingDate, slot];
  let query = `SELECT id FROM glucose_readings WHERE user_id = $1 AND reading_date = $2 AND slot = $3`;
  if (excludeId !== null) {
    query += ` AND id != $4`;
    params.push(excludeId);
  }
  const result = await pool.query(query, params);
  return result.rows[0] ?? null;
}

export async function updateReading(id, userId, readingDate, slot, valueMgdl, notes) {
  const result = await pool.query(
    `UPDATE glucose_readings
     SET reading_date = $3, slot = $4, value_mgdl = $5, notes = $6
     WHERE id = $1 AND user_id = $2
     RETURNING id, reading_date::text AS reading_date, slot, value_mgdl, notes, created_at`,
    [id, userId, readingDate, slot, valueMgdl, notes]
  );
  return result.rows[0] ?? null;
}

export async function deleteReading(id, userId) {
  const result = await pool.query(
    `DELETE FROM glucose_readings WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows[0] ?? null;
}
