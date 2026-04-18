const { Pool } = require('pg');
const DATABASE_URL = 'postgresql://postgres.chdnnhqqlkktnagimzrr:Rinsna%40April4@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  // Check our app sessions table
  const r = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='sessions' AND table_schema='public' ORDER BY ordinal_position");
  console.log('PUBLIC SESSIONS COLS:', r.rows.map(x => x.column_name));

  // Add course_id to public.sessions if missing
  try {
    await pool.query('ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES public.courses(id) ON DELETE SET NULL');
    console.log('Added course_id to sessions OK');
  } catch(e) { console.log('sessions course_id:', e.message); }

  // Add course_id to public.notes if missing  
  try {
    await pool.query('ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES public.courses(id) ON DELETE SET NULL');
    console.log('Added course_id to notes OK');
  } catch(e) { console.log('notes course_id:', e.message); }

  // Check users table
  const u = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND table_schema='public'");
  console.log('USERS COLS:', u.rows.map(x => x.column_name));

  await pool.end();
}
run();
