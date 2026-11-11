import "dotenv/config";
import bcrypt from "bcryptjs";
import pool from "../src/config/db.js";

const SALT_ROUNDS = 12;
const KOLKATA_TZ = "Asia/Kolkata";

function todayInKolkata() {
  return new Date().toLocaleDateString("en-CA", { timeZone: KOLKATA_TZ });
}

function daysAgo(n) {
  const [y, m, d] = todayInKolkata().split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d - n));
  return date.getUTCFullYear() + "-" +
    String(date.getUTCMonth() + 1).padStart(2, "0") + "-" +
    String(date.getUTCDate()).padStart(2, "0");
}

function buildSampleReadings() {
  return [
    { reading_date: daysAgo(0), slot: "morning_fasting", value_mgdl: 92, notes: "Fasting reading" },
    { reading_date: daysAgo(0), slot: "after_breakfast", value_mgdl: 128, notes: null },
    { reading_date: daysAgo(1), slot: "morning_fasting", value_mgdl: 88, notes: null },
    { reading_date: daysAgo(1), slot: "after_lunch", value_mgdl: 115, notes: null },
    { reading_date: daysAgo(1), slot: "after_dinner", value_mgdl: 142, notes: "Felt a bit high after dinner" },
    { reading_date: daysAgo(3), slot: "morning_fasting", value_mgdl: 95, notes: null },
    { reading_date: daysAgo(3), slot: "after_breakfast", value_mgdl: 110, notes: null },
    { reading_date: daysAgo(3), slot: "after_lunch", value_mgdl: 130, notes: null },
    { reading_date: daysAgo(3), slot: "after_dinner", value_mgdl: 105, notes: null },
    { reading_date: daysAgo(5), slot: "morning_fasting", value_mgdl: 85, notes: null },
    { reading_date: daysAgo(5), slot: "after_dinner", value_mgdl: 135, notes: null },
    { reading_date: daysAgo(7), slot: "morning_fasting", value_mgdl: 90, notes: null },
    { reading_date: daysAgo(7), slot: "after_breakfast", value_mgdl: 120, notes: null },
    { reading_date: daysAgo(7), slot: "after_lunch", value_mgdl: 138, notes: null },
    { reading_date: daysAgo(10), slot: "morning_fasting", value_mgdl: 82, notes: null },
    { reading_date: daysAgo(10), slot: "after_breakfast", value_mgdl: 105, notes: null },
    { reading_date: daysAgo(10), slot: "after_lunch", value_mgdl: 125, notes: null },
    { reading_date: daysAgo(10), slot: "after_dinner", value_mgdl: 118, notes: "Good readings today" },
  ];
}

async function seed() {
  const demoName = process.env.SEED_DEMO_NAME;
  const demoEmail = process.env.SEED_DEMO_EMAIL ? process.env.SEED_DEMO_EMAIL.trim().toLowerCase() : undefined;
  const demoPassword = process.env.SEED_DEMO_PASSWORD;

  if (!demoName || !demoEmail || !demoPassword) {
    console.error("Missing required env vars: SEED_DEMO_NAME, SEED_DEMO_EMAIL, SEED_DEMO_PASSWORD");
    process.exit(1);
  }

  const readings = buildSampleReadings();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [demoEmail]
    );

    let userId;
    let userCreated;

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      userCreated = false;
    } else {
      const passwordHash = await bcrypt.hash(demoPassword, SALT_ROUNDS);
      const result = await client.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
        [demoName, demoEmail, passwordHash]
      );
      userId = result.rows[0].id;
      userCreated = true;
    }

    let inserted = 0;
    let skipped = 0;

    for (const r of readings) {
      const result = await client.query(
        "INSERT INTO glucose_readings (user_id, reading_date, slot, value_mgdl, notes) " +
        "VALUES ($1, $2, $3, $4, $5) " +
        "ON CONFLICT (user_id, reading_date, slot) DO NOTHING " +
        "RETURNING id",
        [userId, r.reading_date, r.slot, r.value_mgdl, r.notes]
      );
      if (result.rows.length > 0) {
        inserted++;
      } else {
        skipped++;
      }
    }

    await client.query("COMMIT");

    console.log("Seed complete:");
    console.log("  User: " + (userCreated ? "created" : "already existed (password retained from initial creation)") + " (" + demoEmail + ")");
    console.log("  Readings: " + inserted + " inserted, " + skipped + " skipped");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();