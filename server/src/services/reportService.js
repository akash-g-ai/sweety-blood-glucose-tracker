import pool from "../config/db.js";

export async function getDailyAggregate(userId, date) {
  const result = await pool.query(
    "SELECT COUNT(*)::int AS count, " +
    "ROUND(AVG(value_mgdl), 1)::float AS average, " +
    "MAX(value_mgdl) AS highest, " +
    "MIN(value_mgdl) AS lowest " +
    "FROM glucose_readings WHERE user_id = $1 AND reading_date = $2",
    [userId, date]
  );
  return result.rows[0];
}

export async function getDailyReadings(userId, date) {
  const result = await pool.query(
    "SELECT id, slot, value_mgdl, notes " +
    "FROM glucose_readings WHERE user_id = $1 AND reading_date = $2 " +
    "ORDER BY CASE slot " +
    "WHEN 'morning_fasting' THEN 1 " +
    "WHEN 'after_breakfast' THEN 2 " +
    "WHEN 'after_lunch' THEN 3 " +
    "WHEN 'after_dinner' THEN 4 END",
    [userId, date]
  );
  return result.rows;
}

export async function getRangeAggregate(userId, startDate, endDate) {
  const result = await pool.query(
    "SELECT COUNT(*)::int AS count, " +
    "ROUND(AVG(value_mgdl), 1)::float AS average, " +
    "MAX(value_mgdl) AS highest, " +
    "MIN(value_mgdl) AS lowest " +
    "FROM glucose_readings WHERE user_id = $1 AND reading_date BETWEEN $2 AND $3",
    [userId, startDate, endDate]
  );
  return result.rows[0];
}

export async function getTrendData(userId, startDate, endDate) {
  const result = await pool.query(
    "WITH date_range AS (" +
    "  SELECT generate_series($2::date, $3::date, '1 day'::interval)::date AS d" +
    ") " +
    "SELECT " +
    "  to_char(dr.d, 'YYYY-MM-DD') AS date, " +
    "  ROUND(AVG(gr.value_mgdl), 1)::float AS average, " +
    "  COUNT(gr.id)::int AS count " +
    "FROM date_range dr " +
    "LEFT JOIN glucose_readings gr ON gr.reading_date = dr.d AND gr.user_id = $1 " +
    "GROUP BY dr.d " +
    "ORDER BY dr.d",
    [userId, startDate, endDate]
  );
  return result.rows;
}