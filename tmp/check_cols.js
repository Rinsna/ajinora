const { Pool } = require('pg');
const DATABASE_URL = 'postgresql://postgres.chdnnhqqlkktnagimzrr:Rinsna%40April4@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const sessions = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='sessions' ORDER BY ordinal_position");
  console.log('SESSIONS COLS:', sessions.rows.map(r => r.column_name));

  const notes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='notes' ORDER BY ordinal_position");
  console.log('NOTES COLS:', notes.rows.map(r => r.column_name));

  // Add missing columns
  try { await pool.query('ALTER TABLE sessions ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL'); console.log('sessions.course_id: OK'); } catch(e) { console.log('sessions.course_id error:', e.message); }
  try { await pool.query('ALTER TABLE notes ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL'); console.log('notes.course_id: OK'); } catch(e) { console.log('notes.course_id error:', e.message); }

  await pool.end();
}
run();
