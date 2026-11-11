// Required vars that must be non-empty strings at startup.
// PORT, DB_POOL_MAX, and JWT_EXPIRES_IN are excluded because they have safe defaults.
const REQUIRED = ["NODE_ENV", "DATABASE_URL", "JWT_SECRET"];

export function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    process.stderr.write(
      `Missing required environment variables: ${missing.join(", ")}\n`
    );
    process.exit(1);
  }
}
