require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

// We expect the Neon Postgres connection string in the DATABASE_URL environment variable.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
