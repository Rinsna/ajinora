import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const studentCount: any = await query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const sessionCount: any = await query("SELECT COUNT(*) as count FROM sessions");
    const examCount: any = await query("SELECT COUNT(*) as count FROM exams");
    const noteCount: any = await query("SELECT COUNT(*) as count FROM notes");
    const courseCount: any = await query("SELECT COUNT(*) as count FROM courses");

    const recentLogs: any = await query(`
        SELECT al.id, al.action, al.timestamp as created_at, u.full_name, u.username 
        FROM activity_logs al 
        JOIN users u ON al.user_id = u.id 
        ORDER BY al.timestamp DESC 
        LIMIT 5
    `);

    return NextResponse.json({
      studentCount: studentCount[0].count,
      sessionCount: sessionCount[0].count,
      examCount: examCount[0].count,
      noteCount: noteCount[0].count,
      courseCount: courseCount[0].count,
      recentLogs: recentLogs
    });
  } catch (error) {
    console.error("Admin Stats Retrieval Fault:", error);
    return NextResponse.json({ error: "Failed to pull system telemetry." }, { status: 500 });
  }
}
