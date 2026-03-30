import { Pool } from 'pg';

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
  let i = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++i}`);

  try {
    const result = await getPool().query(pgSql, params);
    return result.rows;
  } catch (error: any) {
    console.error('PostgreSQL query error:', error.message);
    throw error;
  }
}

export default { query };
