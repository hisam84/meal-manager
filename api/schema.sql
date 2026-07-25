-- Database schema for Mess Meal Tracker (Neon Postgres)

CREATE TABLE IF NOT EXISTS messes (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS meals (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS manager_terms (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS cook_bills (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL
);

-- For singleton objects (Settings, MealSettings)
CREATE TABLE IF NOT EXISTS kv_store (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL
);
