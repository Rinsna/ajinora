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
    // Self-healing: Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        title VARCHAR(100),
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const certificates = await query(
      "SELECT * FROM certificates WHERE user_id = ? ORDER BY created_at DESC",
      [studentId]
    );

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Fetch Student Certificates Admin Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const resolvedParams = await params;
  const studentId = resolvedParams.id;

  try {
    const { title, url } = await request.json();
    if (!title || !url) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    await query(
      "INSERT INTO certificates (user_id, title, url) VALUES (?, ?, ?)",
      [studentId, title, url]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Issuance failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    await query("DELETE FROM certificates WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Revocation failed" }, { status: 500 });
  }
}
