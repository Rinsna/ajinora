import { Pool } from 'pg';

// Use DATABASE_URL for PostgreSQL (Render/production)
// Falls back to SQLite for local development if DATABASE_URL is not set
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function query(sql: string, params: any[] = []) {
  // Convert SQLite ? placeholders to PostgreSQL $1, $2, ... placeholders
  let pgSql = sql;
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

  try {
    const client = getPool();
    const result = await client.query(pgSql, params);
    return result.rows;
  } catch (error: any) {
    console.error('PostgreSQL query error:', error.message);
    throw error;
  }
}

export default { query };
