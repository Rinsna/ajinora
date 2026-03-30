import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 403 });
    }

    const { title, description, duration, startDate, startTime, courseId, negativeMark, questions } = await request.json();

    if (!title || !duration || !startDate || !startTime || !courseId || !questions) {
      return NextResponse.json({ error: "Missing exam profile data or tracking specifics" }, { status: 400 });
    }

    // Insert exam
    const result: any = await query(
      "INSERT INTO exams (title, description, duration, start_date, start_time, course_id, negative_mark) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
      [title, description, duration, startDate, startTime, courseId, negativeMark || 0]
    );

    const examId = result[0].id;

    // Insert questions
    if (questions && questions.length > 0) {
      const placeholders = questions.map(() => "(?, ?, ?, ?)").join(", ");
      const values = questions.flatMap((q: any) => [
        examId, 
        q.question, 
        JSON.stringify(q.options), 
        q.correctAnswer
      ]);
      await query(
        `INSERT INTO questions (exam_id, question, options, correct_answer) VALUES ${placeholders}`,
        values
      );
    }

    // Audit Log
    await query(
      "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
      [session.user.id, `Created Exam: ${title}`]
    );

    return NextResponse.json({ success: true, examId });
  } catch (error) {
    console.error("Admin Exams API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const exams = await query(
      `SELECT e.*, 
        (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as "questionsCount",
        c.title as course_name
       FROM exams e
       LEFT JOIN courses c ON e.course_id = c.id
       ORDER BY e.created_at DESC`
    );
    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
