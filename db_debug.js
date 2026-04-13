const { Pool } = require('pg');
const fs = require('fs');

function loadEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

async function debug() {
  loadEnv();
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query("SELECT id, username, role, full_name FROM users");
    console.log("Users in DB:", JSON.stringify(res.rows, null, 2));
    
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables in DB:", tables.rows.map(t => t.table_name));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

debug();
