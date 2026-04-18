const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://postgres.chdnnhqqlkktnagimzrr:Rinsna%40April4@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true', 
  ssl: { rejectUnauthorized: false } 
});

pool.query('SELECT id, username, role, password FROM users WHERE username = $1', ['admin'])
  .then(r => { 
    console.log('ROWS:', r.rows.length); 
    if (r.rows[0]) console.log('PASSWORD:', r.rows[0].password);
    pool.end(); 
  })
  .catch(e => { console.log('ERROR:', e.message); pool.end(); });
