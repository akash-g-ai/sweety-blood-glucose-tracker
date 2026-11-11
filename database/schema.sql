-- database/schema.sql
-- Sweety -- Blood Glucose Tracker

-- ============================================================
-- users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         TEXT         NOT NULL,
    password_hash TEXT         NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT uq_users_email  UNIQUE (email),
    CONSTRAINT chk_users_email CHECK  (email LIKE '%@%')
);

-- ============================================================
-- glucose_readings
-- ============================================================
CREATE TABLE IF NOT EXISTS glucose_readings (
    id           INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      INTEGER      NOT NULL
                     REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE         NOT NULL,
    slot         TEXT         NOT NULL,
    value_mgdl   INTEGER      NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT uq_glucose_user_date_slot
        UNIQUE (user_id, reading_date, slot),

    CONSTRAINT chk_glucose_value_range
        CHECK (value_mgdl >= 40 AND value_mgdl <= 600),

    CONSTRAINT chk_glucose_slot
        CHECK (slot IN (
            'morning_fasting',
            'after_breakfast',
            'after_lunch',
            'after_dinner'
        ))
);
