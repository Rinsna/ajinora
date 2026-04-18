const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://postgres.chdnnhqqlkktnagimzrr:Rinsna%40April4@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  // Test the exact query from login route
  const result = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
  console.log('USER FOUND:', result.rows.length > 0 ? 'YES' : 'NO');
  if (result.rows[0]) {
    console.log('PASSWORD HASH:', result.rows[0].password?.substring(0, 20) + '...');
    const match = await bcrypt.compare('admin123', result.rows[0].password);
    console.log('PASSWORD MATCH (admin123):', match);
  }
  await pool.end();
}
run().catch(e => { console.log('ERROR:', e.message); pool.end(); });
