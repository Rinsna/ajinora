const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.chdnnhqqlkktnagimzrr:Rinsna%40April4@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
  .then(r => {
    console.log('TABLES:', r.rows.map(t => t.table_name));
    pool.end();
  })
  .catch(e => {
    console.log('ERROR:', e.message);
    pool.end();
  });
