import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRows: any = await query("SELECT course_id FROM users WHERE id = ?", [session.user.id]);

    if (!userRows || userRows.length === 0 || !userRows[0].course_id) {
      return NextResponse.json([]);
    }

    const courseId = userRows[0].course_id;

    // Fetch exams for the student's course with question count and result
    const exams: any = await query(`
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as questions_count,
        r.score as result_score,
        r.total as result_total
      FROM exams e
      LEFT JOIN exam_results r ON e.id = r.exam_id AND r.user_id = ?
      WHERE e.course_id = ?
      ORDER BY e.start_date DESC
    `, [session.user.id, courseId]);

    const formatted = exams.map((e: any) => {
      const isCompleted = e.result_score !== null && e.result_score !== undefined;
      return {
        id: e.id,
        title: e.title,
        description: e.description,
        questions: Number(e.questions_count) || 0,
        duration: e.duration,
        deadline: new Date(e.start_date).toLocaleDateString() + (e.start_time ? ' ' + e.start_time : ''),
        status: isCompleted ? "completed" : "pending",
        result: isCompleted ? `${e.result_score}/${e.result_total}` : null,
        rank: "Pending",
        priority: "high"
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Student Exams fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
