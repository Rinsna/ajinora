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

    // Return resources that are either:
    // 1. Not assigned to any course (visible to all students), OR
    // 2. Assigned to the student's enrolled course
    const notes: any = await query(
      `SELECT n.*, c.title as course_title 
       FROM notes n 
       LEFT JOIN courses c ON n.course_id = c.id 
       WHERE n.course_id IS NULL OR n.course_id = ?
       ORDER BY n.created_at DESC`,
      [studentCourseId]
    );

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Student Notes fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
