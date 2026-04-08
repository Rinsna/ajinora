import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const results = await query(`
      SELECT er.*, u.full_name, u.username
      FROM exam_results er
      LEFT JOIN users u ON er.user_id = u.id
      WHERE er.exam_id = ?
      ORDER BY er.completed_at DESC
    `, [id]);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Admin Fetch Exam Results Error:", error);
    return NextResponse.json({ error: "Institutional system fault." }, { status: 500 });
  }
}
