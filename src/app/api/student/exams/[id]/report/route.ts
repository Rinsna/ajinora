import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const results: any = await query(`
      SELECT 
        r.score,
        r.total,
        r.completed_at,
        u.full_name as student_name,
        (
          SELECT rank FROM (
            SELECT user_id, RANK() OVER(ORDER BY score DESC, completed_at ASC) as rank
            FROM exam_results
            WHERE exam_id = ?
          ) ranks WHERE user_id = ?
        ) as student_rank
      FROM exam_results r
      JOIN users u ON r.user_id = u.id
      WHERE r.exam_id = ? AND r.user_id = ?
    `, [id, session.user.id, id, session.user.id]);

    if (results.length === 0) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const res = results[0];
    const percentage = (res.score / res.total) * 100;
    
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    return NextResponse.json({
      examId: id,
      studentName: res.student_name,
      completedAt: new Date(res.completed_at).toLocaleString(),
      score: res.score,
      total: res.total,
      grade,
      rank: res.student_rank,
    });
  } catch (error) {
    console.error("Fetch Report Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
