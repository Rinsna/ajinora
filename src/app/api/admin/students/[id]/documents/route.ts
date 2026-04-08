import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const resolvedParams = await params;
  const studentId = resolvedParams.id;

  try {
    const documents = await query(
      "SELECT * FROM student_documents WHERE user_id = ? ORDER BY created_at DESC",
      [studentId]
    );

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Fetch Student Documents Admin Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, status } = await request.json();
    await query("UPDATE student_documents SET status = ? WHERE id = ?", [status, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
     return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
