require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false
});

async function main() {
  try {
    console.log("Running migration...");
    await pool.query(`
      ALTER TABLE exams
      ADD COLUMN IF NOT EXISTS course_id INT REFERENCES courses(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS start_time TIME;
    `);
    console.log("Migration successful! Added course_id and start_time to exams.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

main();
