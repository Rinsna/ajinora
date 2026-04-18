const { Pool } = require('pg');
const DATABASE_URL = 'postgresql://postgres.chdnnhqqlkktnagimzrr:Rinsna%40April4@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const users = await pool.query('SELECT id, username, role FROM users');
  console.log('USERS:', JSON.stringify(users.rows));
  await pool.end();
}
run().catch(e => { console.log('ERROR:', e.message); pool.end(); });
