import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    // 1. Get student course information
    const user: any = await query(`
        SELECT u.id, u.full_name, c.title as course_title, c.id as course_id, c.thumbnail as course_thumbnail, c.description as course_description
        FROM users u
        LEFT JOIN courses c ON u.course_id = c.id
        WHERE u.id = ?
    `, [session.user.id]);

    const enrolledCourse = user[0] || null;

    // 2. Fetch system learning assets (Global for now, can be narrowed)
    const upcomingSessions: any = await query("SELECT * FROM sessions ORDER BY date ASC, time ASC LIMIT 3");
    const upcomingExams: any = await query("SELECT * FROM exams ORDER BY start_date ASC LIMIT 2");
    const recentNotes: any = await query("SELECT * FROM notes ORDER BY created_at DESC LIMIT 4");

    return NextResponse.json({
        user: enrolledCourse,
        upcomingSessions,
        upcomingExams,
        recentNotes
    });

  } catch (error) {
    console.error("Student Dashboard Data Fault:", error);
    return NextResponse.json({ error: "Failed to pull educational matrix data." }, { status: 500 });
  }
}
