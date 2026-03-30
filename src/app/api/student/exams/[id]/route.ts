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

    // Fetch exam details
    const exam: any = await query(
      "SELECT id, title, description, duration, negative_mark FROM exams WHERE id = ?",
      [id]
    );

    if (exam.length === 0) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Fetch questions
    const questions: any = await query(
      "SELECT id, question, options FROM questions WHERE exam_id = ?",
      [id]
    );

    // Parse options from JSON string if needed (some db drivers return string, some object)
    const formattedQuestions = questions.map((q: any) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    return NextResponse.json({
      exam: exam[0],
      questions: formattedQuestions
    });
  } catch (error) {
    console.error("Fetch Exam Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
