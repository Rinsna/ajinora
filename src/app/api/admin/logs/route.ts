import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const logs = await query(`
      SELECT 
        l.id, 
        l.action, 
        l.timestamp as created_at, 
        u.full_name,
        u.username
      FROM activity_logs l 
      JOIN users u ON l.user_id = u.id 
      ORDER BY l.timestamp DESC 
      LIMIT 100
    `);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Log Synchronization Error:', error);
    return NextResponse.json({ error: 'Institutional audit trail offline.' }, { status: 500 });
  }
}
