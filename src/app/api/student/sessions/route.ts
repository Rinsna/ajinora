import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student's enrolled course
    const userRows: any = await query("SELECT course_id FROM users WHERE id = ?", [session.user.id]);
    const studentCourseId = userRows?.[0]?.course_id ?? null;

    // Return sessions that are either:
    // 1. Not assigned to any course (visible to all students), OR
    // 2. Assigned to the student's enrolled course
    const sessions: any = await query(
      `SELECT s.*, c.title as course_title 
       FROM sessions s 
       LEFT JOIN courses c ON s.course_id = c.id 
       WHERE s.course_id IS NULL OR s.course_id = ?
       ORDER BY s.date ASC, s.time ASC`,
      [studentCourseId]
    );

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Student Sessions fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
