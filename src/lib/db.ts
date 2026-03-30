import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      console.error("CRITICAL ERROR: DATABASE_URL environment variable is missing!");
      throw new Error("DATABASE_URL environment variable is not configured. Please add it to Vercel environment variables.");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query(sql: string, params: any[] = []) {
  // Convert SQLite ? placeholders to PostgreSQL $1, $2, ... placeholders
  let i = 0;
  const pgSql = sql.replace(/\?/g, function() { i++; return '$' + i; });

  try {
    const result = await getPool().query(pgSql, params);
    return result.rows;
  } catch (error: any) {
    console.error('PostgreSQL query error:', error.message, 'SQL:', pgSql);
    throw error;
  }
}

export default { query };
