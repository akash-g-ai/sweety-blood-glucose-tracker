// dotenv must be the first import so process.env is populated before any
// other module reads configuration values.
import "dotenv/config";
import { validateEnv } from "./utils/validateEnv.js";

validateEnv();

const rawPort = process.env.PORT ?? "5000";
const PORT = parseInt(rawPort, 10);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`Invalid PORT value: "${rawPort}". Must be an integer 1-65535.`);
  process.exit(1);
}

// Import app after env validation so db.js receives a populated process.env
import app from "./app.js";

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
