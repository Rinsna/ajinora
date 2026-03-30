import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resolvedParams = await params;
    const examId = resolvedParams.id;
    const body = await request.json();
    const { answers } = body; // answers map: { question_id: selected_option }

    if (!answers) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    // Fetch correct answers for comparison
    const correctAnswers: any = await query(
      "SELECT id, correct_answer FROM questions WHERE exam_id = ?",
      [examId]
    );

    // Fetch negative marking setting
    const examMeta: any = await query(
      "SELECT negative_mark FROM exams WHERE id = ?",
      [examId]
    );

    const negMark = examMeta[0]?.negative_mark || 0;
    let correct = 0;
    let wrong = 0;
    const total = correctAnswers.length;

    correctAnswers.forEach((q: any) => {
      const selected = answers[q.id];
      if (selected === q.correct_answer) {
        correct++;
      } else if (selected && selected !== q.correct_answer) {
        wrong++;
      }
    });

    const finalScore = correct - (wrong * negMark);

    // Store result
    await query(
      "INSERT INTO exam_results (user_id, exam_id, score, total) VALUES (?, ?, ?, ?)",
      [session.user.id, examId, finalScore, total]
    );

    // Activity Log
    await query(
      "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
      [session.user.id, `Submitted Exam: ID ${examId}. Score: ${finalScore}/${total}`]
    );

    return NextResponse.json({ success: true, score: finalScore, total, correct, wrong });
  } catch (error) {
    console.error("Exam Submission Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
