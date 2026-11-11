import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX ?? "10", 10),
  connectionTimeoutMillis: 2500,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("Idle PostgreSQL client error:", err.message);
});

export default pool;
