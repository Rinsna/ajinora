import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });

  try {
    const content: any = await query(
      "SELECT * FROM course_content WHERE course_id = ? ORDER BY created_at ASC",
      [id]
    );
    return NextResponse.json(content);
  } catch (error) {
    console.error("Content Retrieval Fault:", error);
    return NextResponse.json({ error: "Failed to pull educational content archives." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const { title, details, type } = await request.json();

    if (!title) {
        return NextResponse.json({ error: "Missing required identification." }, { status: 400 });
    }

    const result: any = await query(
      "INSERT INTO course_content (course_id, title, details, type) VALUES (?, ?, ?, ?)",
      [id, title, details, type || 'lesson']
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Content Injection Fault:", error);
    return NextResponse.json({ error: "Failed to commit educational module." }, { status: 500 });
  }
}
