import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set. Please configure it in your deployment settings.');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
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
    console.error('PostgreSQL query error:', error.message, 'SQL:', pgSql);
    throw error;
  }
}

export default { query };
