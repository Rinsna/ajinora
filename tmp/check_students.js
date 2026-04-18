const { Pool } = require('pg');
const DATABASE_URL = 'postgresql://postgres.chdnnhqqlkktnagimzrr:Rinsna%40April4@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

pool.query(`
  SELECT u.id, u.username, u.full_name as name, u.course_id, u.created_at, c.title as courseTitle 
  FROM users u
  LEFT JOIN courses c ON u.course_id = c.id
  WHERE u.role = 'student' 
  ORDER BY u.created_at DESC
`).then(r => {
  console.log('STUDENTS:', JSON.stringify(r.rows));
  pool.end();
}).catch(e => {
  console.log('ERROR:', e.message);
  pool.end();
});
