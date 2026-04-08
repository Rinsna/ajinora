import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS student_documents (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        title VARCHAR(100),
        url TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const documents = await query(
      "SELECT * FROM student_documents WHERE user_id = ? ORDER BY created_at DESC",
      [session.user.id]
    );

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Fetch Student Documents Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, url } = await request.json();
    if (!title || !url) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    await query(
      "INSERT INTO student_documents (user_id, title, url) VALUES (?, ?, ?)",
      [session.user.id, title, url]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload Student Document Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    await query(
      "DELETE FROM student_documents WHERE id = ? AND user_id = ?",
      [id, session.user.id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
