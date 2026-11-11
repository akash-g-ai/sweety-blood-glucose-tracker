# Sweety - Blood Glucose Tracker

A full-stack blood glucose tracking application built for the Kenpath Junior Full Stack Developer assignment. Users can register, log in, record daily glucose readings across four time slots, view summary reports, and track monthly trends through an interactive chart.

## Key Features

- **User authentication** - JWT-based signup and login with bcrypt password hashing
- **Glucose CRUD** - Create, read, update, and delete readings with full validation
- **Four daily slots** - Morning Fasting, After Breakfast, After Lunch, After Dinner
- **Duplicate prevention** - One reading per user per date per slot (enforced at both application and database levels)
- **Glucose validation** - Whole-number values between 40-600 mg/dL, no future dates
- **Summary reports** - Daily, month-to-date, and previous calendar month statistics
- **Monthly trend chart** - SVG line chart showing daily average glucose with gap handling for missing dates
- **Data isolation** - Every query filters by authenticated user ID; users cannot access each other's data
- **Responsive design** - Premium medical SaaS UI with teal/lavender accents, works on desktop and mobile
- **ECG loading indicator** - Subtle clinical animation during API requests

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 8, React Router 7 |
| Backend | Node.js 20, Express 5 |
| Database | PostgreSQL (Neon Serverless) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Language | JavaScript ES Modules throughout |

## Screenshots

<table>
  <tr>
    <td align="center"><img src="screenshots/Login.png" alt="Login page" width="400"/><br/><sub>Login page</sub></td>
    <td align="center"><img src="screenshots/Signup.png" alt="Signup page" width="400"/><br/><sub>Signup page</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="screenshots/Dashboard.png" alt="Dashboard with readings" width="400"/><br/><sub>Dashboard with readings</sub></td>
    <td align="center"><img src="screenshots/Reports.png" alt="Reports and trend chart" width="400"/><br/><sub>Reports and trend chart</sub></td>
  </tr>
</table>

## Project Structure

```
sweety/
+-- package.json                     # Root monorepo scripts
+-- .gitignore
+-- README.md
+-- screenshots/                      # Application screenshots
|   +-- Login.png
|   +-- Signup.png
|   +-- Dashboard.png
|   +-- Reports.png
+-- database/
|   +-- schema.sql                    # PostgreSQL schema DDL
+-- server/
|   +-- .env.example                  # Server environment template
|   +-- package.json
|   +-- src/
|       +-- server.js                 # Entry point (dotenv, env validation, listen)
|       +-- app.js                    # Express app (middleware, routes, error handler)
|       +-- config/
|       |   +-- db.js                 # pg Pool via DATABASE_URL
|       +-- controllers/
|       |   +-- authController.js     # Register, login
|       |   +-- glucoseController.js # CRUD + validation
|       |   +-- healthController.js  # Health check
|       |   +-- reportController.js  # Summary + trend
|       +-- middleware/
|       |   +-- authenticate.js       # JWT verification
|       |   +-- errorHandler.js       # Centralised error handler
|       +-- routes/
|       |   +-- auth.js
|       |   +-- glucose.js
|       |   +-- health.js
|       |   +-- reports.js
|       +-- services/
|       |   +-- userService.js       # User SQL queries
|       |   +-- glucoseService.js    # Reading SQL queries
|       |   +-- reportService.js      # Report SQL queries
|       +-- utils/
|           +-- validateEnv.js        # Startup env var validation
+-- client/
    +-- .env.example                  # Client environment template
    +-- index.html
    +-- vite.config.js                # Vite config with /api proxy
    +-- src/
        +-- App.jsx                   # Router setup with auth guards
        +-- main.jsx                  # Entry point
        +-- components/
        |   +-- ErrorMessage.jsx
        |   +-- Header.jsx
        |   +-- LoadingIndicator.jsx   # ECG-style loading animation
        |   +-- ProtectedRoute.jsx     # Auth guard
        |   +-- ReadingCard.jsx
        |   +-- ReadingForm.jsx        # Add/edit form with validation
        |   +-- ReadingList.jsx       # Date-grouped reading display
        |   +-- ReportSummary.jsx      # Stat cards for reports
        |   +-- TrendChart.jsx         # SVG line chart
        +-- hooks/
        |   +-- useAuth.jsx           # Auth context (login, register, logout)
        +-- pages/
        |   +-- LoginPage.jsx
        |   +-- SignupPage.jsx
        |   +-- DashboardPage.jsx      # Main authenticated view
        +-- services/
        |   +-- api.js                # Fetch wrapper with JWT injection
        +-- styles/
        |   +-- index.css             # Design system
        |   +-- auth.css
        |   +-- dashboard.css
        +-- utils/
            +-- constants.js           # API paths, slots, date helpers
```

## Prerequisites

- Node.js 20 LTS
- A Neon PostgreSQL project (or any PostgreSQL instance)
- npm

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd sweety

# Install all dependencies (server + client)
npm run install:all
```

## Neon PostgreSQL Database Setup

1. Create a project at [console.neon.tech](https://console.neon.tech)
2. Copy your connection string from the Neon dashboard
3. Execute the schema:

```bash
psql "postgresql://user:password@host/dbname?sslmode=require" -f database/schema.sql
```

4. Add the name column (required for registration):

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
```

## Environment Variables

### Server (server/.env)

Copy server/.env.example to server/.env and fill in your values:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://your_user:your_password@your_neon_host/your_db?sslmode=require
DB_POOL_MAX=10
JWT_SECRET=replace_with_a_long_random_secret_at_least_64_characters
JWT_EXPIRES_IN=7d
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Client (client/.env)

Copy client/.env.example to client/.env if you need to override the API base URL:

```env
VITE_API_BASE_URL=/api
```

The client uses a Vite proxy in development to forward /api requests to the backend, so the default /api works without changes.

## Startup Commands

```bash
# Terminal 1 - Start the backend
cd server
node src/server.js

# Terminal 2 - Start the frontend
cd client
npm run dev
```

Or from the root directory:

```bash
npm run start:server    # Starts backend
npm run start:client    # Starts frontend dev server
```

The frontend runs at http://localhost:5173 and the backend at http://localhost:5000.

## API Documentation

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check with database connectivity status |
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and receive JWT |

### Authenticated Endpoints (requires Authorization: Bearer <token>)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/readings | List all readings for the authenticated user |
| POST | /api/readings | Create a new reading |
| GET | /api/readings/:id | Get a single reading by ID |
| PUT | /api/readings/:id | Update a reading by ID |
| DELETE | /api/readings/:id | Delete a reading by ID |
| GET | /api/reports/summary | Daily, month-to-date, and previous-month statistics |
| GET | /api/reports/trend | Daily glucose averages for the current month |

### Request/Response Examples

**Register:**

```
POST /api/auth/register
Body: { "name": "Alex", "email": "alex@example.com", "password": "s3cur3pass" }
Response 201: { "token": "<jwt>", "user": { "id": 1, "name": "Alex", "email": "alex@example.com" } }
```

**Login:**

```
POST /api/auth/login
Body: { "email": "alex@example.com", "password": "s3cur3pass" }
Response 200: { "token": "<jwt>", "user": { "id": 1, "name": "Alex", "email": "alex@example.com" } }
```

**Create Reading:**

```
POST /api/readings
Headers: Authorization: Bearer <token>
Body: { "reading_date": "2026-11-10", "slot": "morning_fasting", "value_mgdl": 95, "notes": "Felt fine" }
Response 201: { "id": 1, "reading_date": "2026-11-10", "slot": "morning_fasting", "value_mgdl": 95, "notes": "Felt fine", "created_at": "2026-11-10T08:00:00.000Z" }
```

**Summary Report:**

```
GET /api/reports/summary
Headers: Authorization: Bearer <token>
Response 200:
{
  "daily": { "date": "2026-11-10", "count": 2, "average": 102.5, "highest": 120, "lowest": 85, "readings": [...] },
  "month_to_date": { "start_date": "2026-11-01", "end_date": "2026-11-10", "count": 4, "average": 102.5, "highest": 120, "lowest": 85 },
  "previous_month": { "start_date": "2026-10-01", "end_date": "2026-10-31", "count": 0, "average": null, "highest": null, "lowest": null }
}
```

**Trend Report:**

```
GET /api/reports/trend
Headers: Authorization: Bearer <token>
Response 200:
{
  "period": { "start_date": "2026-11-01", "end_date": "2026-11-10" },
  "data": [
    { "date": "2026-11-01", "average": null, "count": 0 },
    { "date": "2026-11-02", "average": 95.5, "count": 2 }
  ]
}
```

## Authentication and Security

- **Password hashing**: Passwords are hashed with bcryptjs at cost factor 12 before storage. Plain-text passwords are never stored or logged.
- **JWT tokens**: Signed with JWT_SECRET from environment variables. Payload contains only { id, email }. Expiry defaults to 7 days.
- **Token verification**: The authenticate middleware verifies the JWT signature, checks expiry, and validates that the payload contains a positive integer id and non-empty email string before setting req.user.
- **Timing-safe login**: When an email is not found during login, a dummy bcrypt hash comparison still runs to prevent timing-based user enumeration.
- **Generic errors**: Login returns the same error message for wrong email and wrong password to prevent enumeration.
- **401 handling**: The frontend clears the JWT from localStorage and React state when any authenticated request returns 401, redirecting the user to login.
- **CORS**: All origins are allowed in development (NODE_ENV=development). In production, CORS is restricted to the CORS_ORIGIN environment variable.
- **SQL injection prevention**: All database queries use parameterized values via pg Pool. No string interpolation in SQL.

## Glucose Validation Rules

All validation runs in the backend controller before any database query:

| Field | Rule |
|-------|------|
| reading_date | Required, strict YYYY-MM-DD format, must be a real calendar date (rejects 2026-02-31), cannot be in the future (Asia/Kolkata timezone) |
| slot | Required, must be one of: morning_fasting, after_breakfast, after_lunch, after_dinner |
| value_mgdl | Required, must be an integer between 40 and 600 |
| notes | Optional, string or null. If omitted during update, the existing value is preserved |

Duplicate prevention: one reading per user per date per slot. Checked at the application level first, then enforced by the database UNIQUE (user_id, reading_date, slot) constraint. Race conditions are caught via PostgreSQL error code 23505 and returned as HTTP 409.

## Report Calculations

All report date boundaries use the Asia/Kolkata timezone.

- **Daily**: Today's date in Kolkata. Returns count, average (1 decimal), highest, lowest, and individual readings ordered by slot.
- **Month-to-date**: From the 1st of the current calendar month through today. Returns count, average, highest, lowest.
- **Previous calendar month**: The complete previous calendar month (not the previous 30 days). Correctly handles January rollover and leap-year February. Returns count, average, highest, lowest.
- **Empty datasets**: When there are no readings, count is 0 and average/highest/lowest are null.
- **Averages**: Rounded to one decimal place using PostgreSQL ROUND(AVG(value_mgdl), 1).

## Monthly Trend Chart

The trend endpoint returns daily glucose averages for the current calendar month up to today. Dates with no readings are included as null average and 0 count, so the chart displays gaps rather than interpolating across missing data.

The frontend renders this as a lightweight SVG line chart:
- Y-axis auto-scales from the data range with 20-point padding (clamped to 40-600)
- X-axis shows start, middle, and end date labels in MM-DD format
- Line breaks at null averages to create visible gaps
- Data points render as small circles
- Grid lines show reference glucose values

## Seed Data

An idempotent seed script is included to populate the database with a demo user and sample glucose readings.

### Configuration

Add these three variables to `server/.env` (see `server/.env.example` for reference):

```env
SEED_DEMO_NAME=Arjun Kumar
SEED_DEMO_EMAIL=arjun.kumar.demo@example.com
SEED_DEMO_PASSWORD=<your_local_demo_password>
```

Set `SEED_DEMO_PASSWORD` to a password of your choice. This is the password for the demo account used during development.

### Running the Seed Script

```bash
cd server
npm run seed
```

### What It Does

- Creates a demo user (Arjun Kumar) with the configured email and hashed password, only if the email does not already exist.
- Inserts 18 sample glucose readings across 6 dates (today through 10 days ago) covering all four time slots.
- Uses `ON CONFLICT (user_id, reading_date, slot) DO NOTHING` so existing readings are never overwritten.
- Wraps all operations in a database transaction (BEGIN/COMMIT with ROLLBACK on failure).

### Demo Account

- Email: `arjun.kumar.demo@example.com`
- Password: the value you configured in `SEED_DEMO_PASSWORD`

### Idempotency

Rerunning the script will not duplicate the user or any readings. If the demo user already exists, the script reports 'already existed (password retained from initial creation)' and skips user creation. The existing user's name, email, and password are never overwritten. If any reading already exists for the same user/date/slot, it is skipped. The output shows how many readings were inserted vs skipped on each run.

**Note:** The demo password is set during the first seed run using the value of `SEED_DEMO_PASSWORD` in `server/.env`. If you change `SEED_DEMO_PASSWORD` in `.env` after the first run, the login password remains the original value used during creation. To reset the demo password, delete the user from the database and rerun the seed script.

## Tests

No automated test suite is currently included in this project. This is a remaining task for submission completeness. Manual testing was performed throughout development to verify:
- User registration and login
- Glucose CRUD operations
- Duplicate reading prevention
- Data isolation between users
- Report calculations and trend chart rendering
- 401 handling and session expiry

## Assumptions and Limitations

1. **Timezone**: The application uses Asia/Kolkata as the calendar date policy for all date calculations. This affects future-date validation, report boundaries, and the default date in the reading form.
2. **Neon cold starts**: Neon serverless PostgreSQL may take 1-3 seconds to wake from suspend. The first health check or API call after a period of inactivity may be slower. The connection pool timeout is set to 2.5 seconds.
3. **No password reset**: A password reset flow is not implemented.
4. **No data export**: Readings cannot be exported to CSV or other formats.
5. **Single reading per slot**: The schema enforces one reading per user per date per slot. A user cannot log multiple readings for the same slot on the same day.
6. **Reports are relative to today**: The summary and trend endpoints calculate relative to the current date in Kolkata. Historical date range selection is not implemented.

## Future Improvements

- Automated test suite (unit + integration)
- Password reset via email
- CSV export of readings
- Custom date-range report selection
- Glucose target zones (without medical diagnosis)
- PWA support for offline reading entry
- Multi-language support
