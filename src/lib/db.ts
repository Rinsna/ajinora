import Database from 'better-sqlite3';
import path from 'path';

// Use SQLite instead of PostgreSQL for the specialized Ajinora modernization
const dbPath = path.resolve(process.cwd(), 'ajinora.db');
const db = new Database(dbPath, { verbose: console.log });

export async function query(sql: string, params: any[] = []) {
  try {
    const stmt = db.prepare(sql);
    
    // Determine if it's a selection or mutation
    if (sql.trim().toLowerCase().startsWith('select') || sql.includes('RETURNING')) {
      return stmt.all(...params);
    } else {
      const result = stmt.run(...params);
      return result;
    }
  } catch (error: any) {
    // Graceful error for JSON columns in SQLite during initial migration
    if (error.message?.includes('JSON')) {
       console.warn('JSON parsing error in SQLite context - check schema mapping.');
    }
    console.error('SQLite query error:', error);
    throw error;
  }
}

export default db;
